import React from "react";
import { useNavigate } from "react-router-dom";

function Select({ onSelectCaptain }) {
    // 获取导航函数
    const navigate = useNavigate();

    //以下四个函数分别是点击四个按钮后的处理函数

    const handleCaptainClick = () => {
        navigate("/Captain");
        if (typeof onSelectCaptain === 'function') {
            onSelectCaptain();
        }
    };

    const handleJudgeClick = () => {
        navigate("/Judge");
        if (typeof onSelectCaptain === 'function') {
            onSelectCaptain();
        }
    };

    const handleSecondManagerClick = () => {  
        navigate("/SecondManager");
        if (typeof onSelectCaptain === 'function') {
            onSelectCaptain();
        }
    };
    
    const handleSuperManagerClick = () => {
        // 导航到 /SuperManager 页面
        navigate("/SuperManager");
        // 调用回调函数通知父组件隐藏 Select 组件
        if (typeof onSelectCaptain === 'function') {
            onSelectCaptain();
        }
    };
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background: "#f0f0f0"
        }}>
            <h1>南京邮电大学赛事项目审批系统</h1>
            <h1>请登记您的身份</h1>
            {/* 点击“队长”按钮时调用 handleCaptainClick 函数 */}
            <button onClick={handleCaptainClick} style={{ marginBottom: "10px" }}>队长</button>
            <button onClick={handleJudgeClick} style={{ marginBottom: "10px" }}>评委</button>
            <button onClick={handleSecondManagerClick} style={{ marginBottom: "10px" }}>二级管理员</button>
            <button onClick={handleSuperManagerClick} style={{ marginBottom: "10px" }}>超级管理员</button>
        </div>
    );
}

export default Select;