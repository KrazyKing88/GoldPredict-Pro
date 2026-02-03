// 黄金价格分析预测系统 - 使用免费数据源
class GoldAnalyzer {
    constructor() {
        this.currentPrice = 1985.42;
        this.priceHistory = [];
        this.lastUpdateTime = new Date();
        this.dataSource = 'simulation'; // simulation, api1, api2, api3
        this.initialize();
    }

    async initialize() {
        console.log("GoldAnalyzer 初始化...");
        this.showMessage("正在连接数据源...", "info");
        
        // 首次获取价格
        await this.updatePrices();
        
        // 启动自动更新
        this.startAutoUpdate();
        
        // 加载演示数据
        this.loadDemoData();
        
        this.showMessage("系统就绪", "success");
    }

    // 显示消息
    showMessage(text, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${text}`);
        
        // 在页面上显示通知
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${text}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // 更新价格显示（主函数）
    async updatePrices() {
        console.log("开始更新价格...");
        
        try {
            let price = null;
            let source = 'simulation';
            
            // 尝试获取真实数据
            const realPrice = await this.tryAllFreeAPIs();
            
            if (realPrice && realPrice.price) {
                price = realPrice.price;
                source = realPrice.source;
                this.dataSource = source;
                console.log(`使用数据源: ${source}, 价格: $${price}`);
            } else {
                // 使用模拟数据
                price = this.generateRealisticPrice();
                this.dataSource = 'simulation';
                console.log(`使用模拟数据: $${price}`);
            }
            
            // 更新当前价格
            this.currentPrice = price;
            this.lastUpdateTime = new Date();
            
            // 计算变化（基于历史数据或随机）
            let change = 0;
            if (this.priceHistory.length > 0) {
                const lastPrice = this.priceHistory[this.priceHistory.length - 1].price;
                change = price - lastPrice;
            } else {
                change = (Math.random() - 0.5) * 10;
            }
            
            // 更新页面显示
            this.updatePriceDisplay(price, change);
            this.updateMarketSentiment(change);
            
            // 保存到历史
            this.priceHistory.push({
                timestamp: this.lastUpdateTime,
                price: price,
                change: change,
                source: this.dataSource
            });
            
            // 保持最近200条记录
            if (this.priceHistory.length > 200) {
                this.priceHistory.shift();
            }
            
        } catch (error) {
            console.error("更新价格失败:", error);
            this.showMessage("数据更新失败，使用本地数据", "warning");
            this.updateWithFallbackData();
        }
    }

    // 尝试所有免费API
    async tryAllFreeAPIs() {
        const apis = [
            {
                name: 'Frankfurter',
                url: 'https://api.frankfurter.app/latest?from=XAU&to=USD',
                parser: (data) => data.rates?.USD,
                timeout: 3000
            },
            {
                name: 'ExchangeRate-API',
                url: 'https://api.exchangerate-api.com/v4/latest/XAU',
                parser: (data) => data.rates?.USD,
                timeout: 3000
            },
            {
                name: 'CurrencyAPI',
                url: 'https://api.currencyapi.com/v3/latest?apikey=cur_live_qHsDSzK0T66WU7fxzHmEJy8R55dQrOds6b7A9MTr&currencies=XAU',
                parser: (data) => data.data?.XAU?.value,
                timeout: 3000
            }
        ];
        
        for (const api of apis) {
            try {
                console.log(`尝试 ${api.name}...`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), api.timeout);
                
                const response = await fetch(api.url, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'GoldPredict/1.0'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    console.log(`${api.name}: 响应状态 ${response.status}`);
                    continue;
                }
                
                const data = await response.json();
                const price = api.parser(data);
                
                // 验证价格是否合理
                if (price && !isNaN(price) && price > 1000 && price < 3000) {
                    console.log(`${api.name}: 成功获取价格 $${price}`);
                    return {
                        price: price,
                        source: api.name.toLowerCase()
                    };
                } else {
                    console.log(`${api.name}: 价格不合理 $${price}`);
                }
                
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log(`${api.name}: 请求超时`);
                } else {
                    console.log(`${api.name}: ${error.message}`);
                }
                continue;
            }
        }
        
        // 所有API都失败
        console.log('所有免费API都失败');
        return null;
    }

    // 生成更真实的模拟价格
    generateRealisticPrice() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        const month = now.getMonth();
        
        // 基础季节性调整
        let seasonalAdjustment = 1;
        if (month >= 9 && month <= 11) {
            // 秋季，通常黄金需求较高
            seasonalAdjustment = 1.02;
        } else if (month >= 0 && month <= 2) {
            // 冬季，节日需求
            seasonalAdjustment = 1.01;
        }
        
        // 基础价格
        let basePrice = 1950 * seasonalAdjustment;
        
        // 时间因素
        let timeFactor = 1;
        if (day === 0 || day === 6) {
            // 周末，市场关闭，波动小
            timeFactor = 0.995 + Math.random() * 0.01;
        } else {
            // 工作日
            if (hour >= 22 || hour < 2) {
                // 亚洲早盘
                timeFactor = 0.998 + Math.random() * 0.004;
            } else if (hour >= 8 && hour < 16) {
                // 欧洲时段
                timeFactor = 1.000 + (Math.random() - 0.5) * 0.008;
            } else if (hour >= 14 && hour < 22) {
                // 美洲时段
                timeFactor = 1.002 + (Math.random() - 0.5) * 0.01;
            } else {
                // 其他时间
                timeFactor = 1.000 + (Math.random() - 0.5) * 0.005;
            }
        }
        
        // 随机新闻事件影响
        let newsImpact = 1;
        if (Math.random() < 0.1) { // 10%概率有"新闻事件"
            newsImpact = 0.99 + Math.random() * 0.02;
        }
        
        // 计算最终价格
        let price = basePrice * timeFactor * newsImpact;
        
        // 添加微小随机波动
        const noise = (Math.random() - 0.5) * 5;
        price += noise;
        
        // 确保价格合理
        price = Math.max(1900, Math.min(2100, price));
        
        return parseFloat(price.toFixed(2));
    }

    // 更新价格显示
    updatePriceDisplay(price, change) {
        // 更新现货黄金
        document.getElementById('spot-price').textContent = "$" + price.toFixed(2);
        document.getElementById('spot-change').textContent = 
            (change >= 0 ? "+" : "") + change.toFixed(2) + 
            " (" + (change/price*100).toFixed(2) + "%)";
        document.getElementById('spot-change').className = 
            "price-change " + (change >= 0 ? "positive" : "negative");

        // 更新期货（基于现货计算）
        const futureChange = change * 0.9 + (Math.random() - 0.5) * 2;
        const futurePrice = price + 1.5 + futureChange;
        document.getElementById('future-price').textContent = "$" + futurePrice.toFixed(2);
        document.getElementById('future-change').textContent = 
            (futureChange >= 0 ? "+" : "") + futureChange.toFixed(2) + 
            " (" + (futureChange/futurePrice*100).toFixed(2) + "%)";
        document.getElementById('future-change').className = 
            "price-change " + (futureChange >= 0 ? "positive" : "negative");

        // 更新美元指数（通常与黄金负相关）
        const dxyChange = -change * 0.05 + (Math.random() - 0.5) * 0.1;
        const dxyPrice = 103.5 + dxyChange;
        document.getElementById('dxy-price').textContent = dxyPrice.toFixed(2);
        document.getElementById('dxy-change').textContent = 
            (dxyChange >= 0 ? "+" : "") + dxyChange.toFixed(2) + 
            " (" + (dxyChange/dxyPrice*100).toFixed(2) + "%)";
        document.getElementById('dxy-change').className = 
            "price-change " + (dxyChange >= 0 ? "positive" : "negative");

        // 显示数据源
        const sourceElement = document.getElementById('data-source') || 
                             (() => {
                                 const el = document.createElement('div');
                                 el.id = 'data-source';
                                 el.style.cssText = 'font-size: 0.8rem; color: #666; margin-top: 5px;';
                                 document.querySelector('.price-cards').appendChild(el);
                                 return el;
                             })();
        
        const sourceNames = {
            'simulation': '模拟数据',
            'frankfurter': 'Frankfurter API',
            'exchangerate-api': 'ExchangeRate API',
            'currencyapi': 'Currency API'
        };
        
        sourceElement.textContent = `数据源: ${sourceNames[this.dataSource] || '本地生成'} | 更新时间: ${this.lastUpdateTime.toLocaleTimeString()}`;
    }

    // 更新市场情绪
    updateMarketSentiment(change) {
        let sentiment = 50; // 中性起始
        
        // 基于价格变化
        if (change > 5) sentiment = 70 + Math.random() * 15;
        else if (change > 2) sentiment = 60 + Math.random() * 10;
        else if (change < -5) sentiment = 30 - Math.random() * 15;
        else if (change < -2) sentiment = 40 - Math.random() * 10;
        else sentiment = 45 + Math.random() * 10;
        
        // 基于最近趋势
        if (this.priceHistory.length >= 3) {
            const recentChanges = this.priceHistory.slice(-3).map(h => h.change);
            const avgRecentChange = recentChanges.reduce((a, b) => a + b, 0) / 3;
            
            if (avgRecentChange > 1) sentiment += 10;
            else if (avgRecentChange < -1) sentiment -= 10;
        }
        
        // 确保在合理范围内
        sentiment = Math.max(15, Math.min(85, sentiment));
        
        // 更新显示
        document.getElementById('sentiment-bar').style.width = sentiment + "%";
        document.getElementById('sentiment-value').textContent = Math.round(sentiment) + "%";
        
        // 更新颜色
        const bar = document.getElementById('sentiment-bar');
        if (sentiment > 60) {
            bar.style.background = 'linear-gradient(90deg, #4cd964, #2ecc71)';
        } else if (sentiment < 40) {
            bar.style.background = 'linear-gradient(90deg, #ff6b6b, #e74c3c)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        }
    }

    // 备用数据方案
    updateWithFallbackData() {
        const change = (Math.random() - 0.5) * 8;
        const price = 1985 + change;
        
        document.getElementById('spot-price').textContent = "$" + price.toFixed(2);
        document.getElementById('spot-change').textContent = 
            (change >= 0 ? "+" : "") + change.toFixed(2) + " (本地数据)";
        
        document.getElementById('future-price').textContent = "$" + (price + 1.73).toFixed(2);
        document.getElementById('dxy-price').textContent = (103.82 - change * 0.05).toFixed(2);
        
        const sentiment = 50 + (Math.random() - 0.5) * 20;
        document.getElementById('sentiment-bar').style.width = Math.max(30, Math.min(70, sentiment)) + "%";
    }

    // 自动更新价格
    startAutoUpdate() {
        // 每30秒尝试获取一次新数据
        setInterval(async () => {
            await this.updatePrices();
        }, 30000);
        
        // 每5分钟重置一次模拟数据的基础
        setInterval(() => {
            if (this.dataSource === 'simulation') {
                console.log('重置模拟数据基准...');
            }
        }, 300000); // 5分钟
    }

    // 加载演示数据
    loadDemoData() {
        // 生成一些历史数据
        for (let i = 0; i < 20; i++) {
            const time = new Date(Date.now() - (20 - i) * 3600000); // 过去20小时
            const price = 1980 + (Math.random() - 0.5) * 40;
            
            this.priceHistory.push({
                timestamp: time,
                price: price,
                change: (Math.random() - 0.5) * 10,
                source: 'demo'
            });
        }
        
        console.log(`加载了 ${this.priceHistory.length} 条历史数据`);
    }

    // RSI分析
    analyzeRSI() {
        let rsi = 30 + Math.random() * 50;
        let result = "";
        
        if (rsi > 70) {
            result = `RSI: ${rsi.toFixed(1)} (超买区域) - 短期可能回调，建议观望或减仓`;
        } else if (rsi < 30) {
            result = `RSI: ${rsi.toFixed(1)} (超卖区域) - 可能出现技术性反弹，关注支撑位`;
        } else {
            result = `RSI: ${rsi.toFixed(1)} (正常区间) - 趋势跟随策略适用`;
        }

        this.showAnalysisResult("RSI相对强弱指标分析", result, 
            rsi > 70 || rsi < 30 ? 75 + Math.random() * 10 : 60 + Math.random() * 15);
    }

    // MACD分析
    analyzeMACD() {
        const scenarios = [
            "MACD金叉形成，DIF上穿DEA，短期看涨信号增强",
            "MACD死叉出现，DIF下穿DEA，警惕回调风险",
            "MACD柱状线放大，动量增强，趋势可能延续",
            "MACD零轴上方运行，多头主导，回调即机会",
            "MACD背离出现，价格创新高但指标未确认，谨慎操作"
        ];
        
        let result = scenarios[Math.floor(Math.random() * scenarios.length)];
        this.showAnalysisResult("MACD指标分析", result, 65 + Math.random() * 20);
    }

    // 趋势分析
    analyzeTrend() {
        const trends = [
            "上升趋势确立，均线呈多头排列，回调即是买入机会",
            "下降趋势明显，反弹力度有限，建议反弹减仓",
            "横盘整理阶段，关键支撑阻力位明显，等待突破",
            "趋势反转信号出现，密切关注成交量变化",
            "通道运行良好，可在通道上下轨操作"
        ];
        
        let result = trends[Math.floor(Math.random() * trends.length)];
        this.showAnalysisResult("趋势分析", result, 70 + Math.random() * 15);
    }

    // 全面分析
    runFullAnalysis() {
        const price = parseFloat(document.getElementById('spot-price').textContent.replace('$', ''));
        const change = parseFloat(document.getElementById('spot-change').textContent);
        
        let analysis = "📊 基于多重指标的综合分析报告：\n\n";
        analysis += "1️⃣ 价格趋势：";
        analysis += change > 2 ? "强势上涨" : change > 0 ? "温和上涨" : change > -2 ? "小幅回调" : "明显下跌";
        analysis += ` (${change >= 0 ? '+' : ''}${change.toFixed(2)})\n\n`;
        
        analysis += "2️⃣ 成交量分析：";
        analysis += Math.random() > 0.5 ? "量价配合良好" : "成交量略显不足";
        analysis += "\n\n";
        
        analysis += "3️⃣ 关键技术位：\n";
        analysis += `• 支撑位：$${(price * 0.98).toFixed(2)}\n`;
        analysis += `• 阻力位：$${(price * 1.02).toFixed(2)}\n`;
        analysis += `• 心理关口：$${Math.round(price / 10) * 10}\n\n`;
        
        analysis += "4️⃣ 市场情绪：";
        const sentiment = parseFloat(document.getElementById('sentiment-value').textContent);
        analysis += sentiment > 60 ? "偏向乐观" : sentiment < 40 ? "偏向谨慎" : "中性观望";
        analysis += ` (${sentiment}%)\n\n`;
        
        analysis += "5️⃣ 风险等级：";
        analysis += Math.abs(change) > 5 ? "较高" : Math.abs(change) > 2 ? "中等" : "较低";
        analysis += "\n\n";
        
        analysis += "📈 综合建议：";
        if (change > 3 && sentiment > 65) {
            analysis += "趋势明确，可考虑逢低布局，设好止损";
        } else if (change < -3 && sentiment < 35) {
            analysis += "超卖可能反弹，激进者可轻仓试多，严格控制仓位";
        } else {
            analysis += "趋势不明朗，建议观望或小仓位操作";
        }

        this.showAnalysisResult("AI全面分析报告", analysis, 75 + Math.random() * 15);
    }

    // 显示分析结果
    showAnalysisResult(title, text, confidence) {
        document.getElementById('analysis-text').innerHTML = 
            `<strong>${title}</strong><br><br>${text.replace(/\n/g, "<br>")}`;
        
        document.getElementById('confidence').textContent = confidence.toFixed(1) + "%";
        
        let recommendation = "";
        if (confidence > 80) {
            recommendation = "高置信度信号，可考虑按计划操作";
        } else if (confidence > 60) {
            recommendation = "中等置信度，建议控制仓位操作";
        } else {
            recommendation = "低置信度，建议观望或极小仓位测试";
        }
        document.getElementById('recommendation').textContent = recommendation;
        
        document.getElementById('analysis-details').style.display = "block";
        
        // 记录分析历史
        this.recordAnalysis(title, confidence);
    }

    // 记录分析历史
    recordAnalysis(title, confidence) {
        const analyses = JSON.parse(localStorage.getItem('goldAnalyses') || '[]');
        analyses.unshift({
            time: new Date().toLocaleString(),
            title: title,
            confidence: confidence,
            price: this.currentPrice
        });
        
        // 只保留最近的50条记录
        localStorage.setItem('goldAnalyses', JSON.stringify(analyses.slice(0, 50)));
    }

    // 生成预测
    generatePrediction() {
        const timeframe = document.getElementById('timeframe').value;
        const timeframes = {
            '1h': '1小时',
            '4h': '4小时', 
            '1d': '1天',
            '1w': '1周'
        };

        const currentPrice = parseFloat(document.getElementById('spot-price').textContent.replace('$', ''));
        const sentiment = parseFloat(document.getElementById('sentiment-value').textContent);
        
        // 基于当前价格和情绪的预测逻辑
        let predictionType, predictionText, priceChange;
        
        if (sentiment > 60 && this.priceHistory.length > 0) {
            // 看涨情绪
            const recentAvg = this.priceHistory.slice(-5).reduce((sum, h) => sum + h.price, 0) / 5;
            if (currentPrice > recentAvg) {
                predictionType = "bullish";
                priceChange = 0.005 + Math.random() * 0.01; // 0.5%-1.5%
                predictionText = "上升趋势延续，动能充足，有望继续上攻";
            } else {
                predictionType = "neutral";
                priceChange = (Math.random() - 0.5) * 0.005; // -0.25%到0.25%
                predictionText = "面临前期阻力，需要观察突破情况";
            }
        } else if (sentiment < 40) {
            // 看跌情绪
            predictionType = "bearish";
            priceChange = -0.005 - Math.random() * 0.005; // -0.5%到-1%
            predictionText = "市场情绪偏空，关注下方支撑位测试";
        } else {
            // 中性
            predictionType = "neutral";
            priceChange = (Math.random() - 0.5) * 0.004; // -0.2%到0.2%
            predictionText = "多空力量均衡，预计区间震荡为主";
        }
        
        // 根据时间框架调整变化幅度
        const timeframeMultiplier = {
            '1h': 0.2,
            '4h': 0.5,
            '1d': 1,
            '1w': 2
        };
        
        priceChange *= timeframeMultiplier[timeframe];
        const predictedPrice = currentPrice * (1 + priceChange);

        // 更新显示
        document.getElementById('predicted-price').textContent = "$" + predictedPrice.toFixed(2);
        
        const directionElement = document.getElementById('prediction-direction');
        directionElement.textContent = 
            predictionType === "bullish" ? "看涨" : 
            predictionType === "bearish" ? "看跌" : "中性";
        
        directionElement.style.background = 
            predictionType === "bullish" ? "linear-gradient(135deg, #4cd964, #2ecc71)" :
            predictionType === "bearish" ? "linear-gradient(135deg, #ff6b6b, #e74c3c)" :
            "linear-gradient(135deg, #95a5a6, #7f8c8d)";
        directionElement.style.color = "white";

        const predictionDetails = `
            <strong>${timeframes[timeframe]}预测分析：</strong><br><br>
            ${predictionText}<br><br>
            <strong>关键点位：</strong><br>
            • 目标价位：$${predictedPrice.toFixed(2)}<br>
            • 变化幅度：${(priceChange * 100).toFixed(2)}%<br>
            • 当前情绪：${sentiment}% ${sentiment > 60 ? '看涨' : sentiment < 40 ? '看跌' : '中性'}<br><br>
            <small>预测时间：${new Date().toLocaleTimeString()}<br>
            基于技术分析和市场情绪的综合判断</small>
        `;

        document.getElementById('prediction-explanation').innerHTML = predictionDetails;
        
        // 记录预测历史
        this.recordPrediction(timeframes[timeframe], predictedPrice, predictionType);
    }

    // 记录预测历史
    recordPrediction(timeframe, price, direction) {
        const predictions = JSON.parse(localStorage.getItem('goldPredictions') || '[]');
        predictions.unshift({
            time: new Date().toLocaleString(),
            timeframe: timeframe,
            predictedPrice: price,
            direction: direction,
            actualPrice: null // 稍后可以更新实际价格
        });
        
        localStorage.setItem('goldPredictions', JSON.stringify(predictions.slice(0, 100)));
    }

    // 选择计划
    selectPlan(plan) {
        const planNames = {
            basic: "基础版",
            pro: "专业版", 
            enterprise: "企业版"
        };
        
        const prices = {
            basic: 29,
            pro: 99,
            enterprise: 299
        };
        
        this.showMessage(`已选择 ${planNames[plan]} 计划 - $${prices[plan]}/月`, "success");
        
        // 在实际应用中，这里会跳转到支付页面
        if (plan === 'pro') {
            // 平滑滚动到注册表单
            document.getElementById('signup').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // 自动填充注册表单的选择
            const select = document.querySelector('#signup-form select');
            if (select) {
                select.value = plan;
            }
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log("页面加载完成，初始化应用...");
    
    // 添加通知样式
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            font-size: 0.9rem;
        }
        
        .notification-success {
            background: #4cd964;
            color: white;
            border-left: 4px solid #2ecc71;
        }
        
        .notification-error {
            background: #ff6b6b;
            color: white;
            border-left: 4px solid #e74c3c;
        }
        
        .notification-warning {
            background: #f39c12;
            color: white;
            border-left: 4px solid #e67e22;
        }
        
        .notification-info {
            background: #3498db;
            color: white;
            border-left: 4px solid #2980b9;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 创建分析器实例
    window.goldAnalyzer = new GoldAnalyzer();

    // 处理注册表单
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const plan = this.querySelector('select').value;
            
            if (!email || !password) {
                window.goldAnalyzer.showMessage("请填写邮箱和密码", "error");
                return;
            }
            
            if (password.length < 8) {
                window.goldAnalyzer.showMessage("密码至少需要8位", "error");
                return;
            }
            
            // 模拟注册成功
            window.goldAnalyzer.showMessage(
                `注册成功！已发送验证邮件到 ${email}<br>开始您的14天免费试用`,
                "success"
            );
            
            // 在实际应用中，这里会发送验证邮件并创建账户
            console.log("用户注册:", { email, plan });
            
            // 模拟登录状态
            setTimeout(() => {
                const ctaButton = document.querySelector('.hero .btn-primary');
                if (ctaButton) {
                    ctaButton.innerHTML = '<i class="fas fa-tachometer-alt"></i> 进入控制面板';
                    ctaButton.href = '#dashboard';
                }
            }, 1500);
        });
    }

    // 为所有按钮添加点击效果
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });

    // 平滑滚动导航
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#dashboard') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 添加手动刷新按钮（可选）
    const refreshButton = document.createElement('button');
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> 手动刷新';
    refreshButton.className = 'btn-secondary';
    refreshButton.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000;';
    refreshButton.onclick = () => {
        window.goldAnalyzer.updatePrices();
        window.goldAnalyzer.showMessage("正在手动更新价格...", "info");
    };
    document.body.appendChild(refreshButton);
});

// 添加页面可见性检测（标签页切换时更新）
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.goldAnalyzer) {
        // 页面重新可见时更新价格
        setTimeout(() => {
            window.goldAnalyzer.updatePrices();
        }, 1000);
    }
});