// 黄金价格分析预测系统
class GoldAnalyzer {
    constructor() {
        this.currentPrice = 1985.42;
        this.priceHistory = [];
        this.initialize();
    }

    initialize() {
        console.log("GoldAnalyzer 初始化...");
        this.updatePrices();
        this.startAutoUpdate();
        this.loadDemoData();
    }

    // 更新价格显示
    updatePrices() {
        // 模拟价格变化
        const changeSpot = (Math.random() - 0.5) * 5;
        const changeFuture = (Math.random() - 0.5) * 5;
        const changeDXY = (Math.random() - 0.5) * 0.3;

        // 更新现货黄金
        let spotPrice = this.currentPrice + changeSpot;
        document.getElementById('spot-price').textContent = "$" + spotPrice.toFixed(2);
        document.getElementById('spot-change').textContent = 
            (changeSpot >= 0 ? "+" : "") + changeSpot.toFixed(2) + 
            " (" + (changeSpot/spotPrice*100).toFixed(2) + "%)";
        document.getElementById('spot-change').className = 
            "price-change " + (changeSpot >= 0 ? "positive" : "negative");

        // 更新期货
        let futurePrice = spotPrice + 1.73 + changeFuture;
        document.getElementById('future-price').textContent = "$" + futurePrice.toFixed(2);
        document.getElementById('future-change').textContent = 
            (changeFuture >= 0 ? "+" : "") + changeFuture.toFixed(2) + 
            " (" + (changeFuture/futurePrice*100).toFixed(2) + "%)";
        document.getElementById('future-change').className = 
            "price-change " + (changeFuture >= 0 ? "positive" : "negative");

        // 更新美元指数
        let dxyPrice = 103.82 + changeDXY;
        document.getElementById('dxy-price').textContent = dxyPrice.toFixed(2);
        document.getElementById('dxy-change').textContent = 
            (changeDXY >= 0 ? "+" : "") + changeDXY.toFixed(2) + 
            " (" + (changeDXY/dxyPrice*100).toFixed(2) + "%)";
        document.getElementById('dxy-change').className = 
            "price-change " + (changeDXY >= 0 ? "positive" : "negative");

        // 更新市场情绪
        let sentiment = 50 + (Math.random() * 40 - 20); // 30-70之间
        sentiment = Math.max(0, Math.min(100, sentiment));
        document.getElementById('sentiment-bar').style.width = sentiment + "%";
        document.getElementById('sentiment-value').textContent = Math.round(sentiment) + "%";

        // 保存到历史
        this.priceHistory.push({
            timestamp: new Date(),
            price: spotPrice,
            change: changeSpot
        });

        // 保持最近100条记录
        if (this.priceHistory.length > 100) {
            this.priceHistory.shift();
        }
    }

    // 自动更新价格
    startAutoUpdate() {
        setInterval(() => {
            this.updatePrices();
        }, 10000); // 每10秒更新一次
    }

    // 加载演示数据
    loadDemoData() {
        // 这里可以加载更多数据
        console.log("演示数据已加载");
    }

    // RSI分析
    analyzeRSI() {
        let rsi = 30 + Math.random() * 50; // 30-80之间
        let result = "";
        
        if (rsi > 70) {
            result = "RSI: " + rsi.toFixed(1) + " (超买区域) - 建议观望或减仓";
        } else if (rsi < 30) {
            result = "RSI: " + rsi.toFixed(1) + " (超卖区域) - 可能反弹机会";
        } else {
            result = "RSI: " + rsi.toFixed(1) + " (正常区间) - 趋势跟随";
        }

        this.showAnalysisResult("RSI相对强弱指标分析", result, rsi > 70 || rsi < 30 ? 75 : 65);
    }

    // MACD分析
    analyzeMACD() {
        const scenarios = [
            "MACD金叉形成，短期看涨信号",
            "MACD死叉出现，警惕回调风险",
            "MACD柱状线放大，动量增强",
            "MACD零轴上方运行，多头主导"
        ];
        
        let result = scenarios[Math.floor(Math.random() * scenarios.length)];
        this.showAnalysisResult("MACD指标分析", result, 70);
    }

    // 趋势分析
    analyzeTrend() {
        const trends = [
            "上升趋势，均线多头排列",
            "下降趋势，阻力明显",
            "横盘整理，等待突破",
            "趋势反转信号出现"
        ];
        
        let result = trends[Math.floor(Math.random() * trends.length)];
        this.showAnalysisResult("趋势分析", result, 80);
    }

    // 全面分析
    runFullAnalysis() {
        let analysis = "基于多重指标分析：\n\n";
        analysis += "1. 价格趋势：震荡上行\n";
        analysis += "2. 成交量：逐步放大\n";
        analysis += "3. 动能指标：偏强\n";
        analysis += "4. 市场情绪：谨慎乐观\n";
        analysis += "5. 风险等级：中等\n\n";
        analysis += "综合建议：逢低布局，控制仓位";

        this.showAnalysisResult("AI全面分析报告", analysis, 85);
    }

    // 显示分析结果
    showAnalysisResult(title, text, confidence) {
        document.getElementById('analysis-text').innerHTML = 
            "<strong>" + title + "</strong><br><br>" + text.replace(/\n/g, "<br>");
        
        document.getElementById('confidence').textContent = confidence + "%";
        
        let recommendation = "";
        if (confidence > 80) {
            recommendation = "高置信度信号，可考虑操作";
        } else if (confidence > 60) {
            recommendation = "中等置信度，建议谨慎操作";
        } else {
            recommendation = "低置信度，建议观望";
        }
        document.getElementById('recommendation').textContent = recommendation;
        
        document.getElementById('analysis-details').style.display = "block";
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

        // 模拟不同时间框架的预测
        const predictions = {
            bullish: [
                "突破关键阻力位，看涨至$2,000",
                "技术形态良好，继续上行概率大",
                "资金流入明显，支撑价格上涨",
                "基本面利好，长期看涨"
            ],
            bearish: [
                "面临技术性回调，关注支撑位",
                "上方压力较大，短期承压",
                "获利盘了结，可能回调",
                "基本面转弱，谨慎看空"
            ],
            neutral: [
                "多空力量均衡，区间震荡",
                "缺乏明确方向，观望为主",
                "等待催化剂，突破后跟进",
                "技术指标中性，建议观望"
            ]
        };

        // 随机选择预测方向
        const direction = Math.random();
        let predictionType, predictionText;
        
        if (direction > 0.6) {
            predictionType = "bullish";
            predictionText = predictions.bullish[Math.floor(Math.random() * predictions.bullish.length)];
        } else if (direction < 0.4) {
            predictionType = "bearish";
            predictionText = predictions.bearish[Math.floor(Math.random() * predictions.bearish.length)];
        } else {
            predictionType = "neutral";
            predictionText = predictions.neutral[Math.floor(Math.random() * predictions.neutral.length)];
        }

        // 生成预测价格
        const currentPrice = parseFloat(document.getElementById('spot-price').textContent.replace('$', ''));
        let predictedPrice;
        
        if (predictionType === "bullish") {
            predictedPrice = currentPrice * (1 + 0.005 + Math.random() * 0.01);
        } else if (predictionType === "bearish") {
            predictedPrice = currentPrice * (0.995 - Math.random() * 0.005);
        } else {
            predictedPrice = currentPrice * (0.999 + Math.random() * 0.002 - 0.001);
        }

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

        document.getElementById('prediction-explanation').innerHTML = 
            "<strong>" + timeframes[timeframe] + "预测：</strong> " + predictionText + 
            "<br><br><small>预测时间：" + new Date().toLocaleTimeString() + "</small>";
    }

    // 选择计划
    selectPlan(plan) {
        const planNames = {
            basic: "基础版",
            pro: "专业版", 
            enterprise: "企业版"
        };
        
        alert("您选择了 " + planNames[plan] + " 计划\n\n" +
              "演示功能：在完整版本中，这里会跳转到支付页面");
        
        // 在实际应用中，这里会跳转到支付页面
        if (plan === 'pro') {
            document.getElementById('signup').scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 创建分析器实例
    window.goldAnalyzer = new GoldAnalyzer();

    // 处理注册表单
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const plan = this.querySelector('select').value;
            
            alert("感谢注册！\n\n" +
                  "邮箱：" + email + "\n" +
                  "计划：" + plan + "\n\n" +
                  "在实际系统中，这里会发送验证邮件并创建账户。\n" +
                  "现在您可以体验所有演示功能。");
            
            // 模拟登录成功
            document.querySelector('.btn-primary').textContent = "进入控制面板";
            
            // 在实际应用中，这里会重定向到用户仪表板
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
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 初始生成一次预测
    window.goldAnalyzer.generatePrediction();
});

// 添加一些工具函数
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4cd964' : type === 'error' ? '#ff6b6b' : '#FFD700'};
        color: ${type === 'info' ? '#000' : '#fff'};
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);