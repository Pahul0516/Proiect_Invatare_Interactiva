import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { playPurchaseSound, playButtonSound } from "../services/soundService";
import "./PowerUpShop.css";

interface ShopItem {
    type: "shield" | "timeFreeze" | "extraHint" | "extraLife" | "skipQuestion";
    icon: string;
    name: string;
    description: string;
    cost: number;
}

const SHOP_ITEMS: ShopItem[] = [
    { type: "shield", icon: "🛡️", name: "Scut Protector", description: "Protejează de 1 răspuns greșit", cost: 50 },
    { type: "timeFreeze", icon: "❄️", name: "Timp Înghețat", description: "+10 secunde la cronometru", cost: 30 },
    { type: "extraHint", icon: "💡", name: "Indiciu Extra", description: "50/50 suplimentar în quiz", cost: 40 },
    { type: "extraLife", icon: "❤️", name: "Viață Extra", description: "+1 viață", cost: 80 },
    { type: "skipQuestion", icon: "🔮", name: "Sari Întrebarea", description: "Sari fără penalizare", cost: 60 },
];

const PowerUpShop: React.FC = () => {
    const { coins, powerUps, buyPowerUp, setPhase, triggerAchievementCheck } = useAppContext();
    const [purchaseAnim, setPurchaseAnim] = useState<string | null>(null);
    const [errorShake, setErrorShake] = useState<string | null>(null);

    const handleBuy = (item: ShopItem) => {
        if (coins < item.cost) {
            setErrorShake(item.type);
            setTimeout(() => setErrorShake(null), 500);
            return;
        }

        const success = buyPowerUp(item.type, item.cost);
        if (success) {
            playPurchaseSound();
            setPurchaseAnim(item.type);
            setTimeout(() => setPurchaseAnim(null), 800);
            triggerAchievementCheck();
        }
    };

    const getInventoryCount = (type: string): number => {
        return powerUps[type as keyof typeof powerUps] || 0;
    };

    return (
        <div className="shop-panel">
            <div className="shop-header">
                <h2 className="shop-title">🏪 Magazin Power-Ups</h2>
                <div className="shop-balance">
                    <span className="balance-icon">💰</span>
                    <span className="balance-value">{coins}</span>
                    <span className="balance-label">monede</span>
                </div>
            </div>

            <div className="shop-grid">
                {SHOP_ITEMS.map((item) => {
                    const count = getInventoryCount(item.type);
                    const canAfford = coins >= item.cost;
                    const isAnimating = purchaseAnim === item.type;
                    const isShaking = errorShake === item.type;

                    return (
                        <div
                            key={item.type}
                            className={`shop-card ${isAnimating ? "purchased" : ""} ${isShaking ? "shake" : ""} ${!canAfford ? "unaffordable" : ""}`}
                        >
                            <div className="shop-card-icon">{item.icon}</div>
                            <div className="shop-card-name">{item.name}</div>
                            <div className="shop-card-desc">{item.description}</div>
                            {count > 0 && (
                                <div className="shop-card-inventory">
                                    În inventar: <strong>{count}</strong>
                                </div>
                            )}
                            <button
                                className={`shop-buy-btn ${canAfford ? "" : "disabled"}`}
                                onClick={() => handleBuy(item)}
                            >
                                <span className="buy-cost">💰 {item.cost}</span>
                                <span className="buy-label">Cumpără</span>
                            </button>
                        </div>
                    );
                })}
            </div>

            <button className="shop-back-btn" onClick={() => { playButtonSound(); setPhase("idle"); }}>
                ← Înapoi la hartă
            </button>
        </div>
    );
};

export default PowerUpShop;
