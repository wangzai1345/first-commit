import React from "react";
import { useNavigate } from "react-router-dom";

function Select({ onSelectCaptain }) {
    
    const navigate = useNavigate();

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
        navigate("/SuperManager");
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
            <p>目前所有账号密码都是1</p>
            <button onClick={handleCaptainClick} style={{ marginBottom: "10px" }}>队长</button>
            <button onClick={handleJudgeClick} style={{ marginBottom: "10px" }}>评委</button>
            <button onClick={handleSecondManagerClick} style={{ marginBottom: "10px" }}>二级管理员</button>
            <button onClick={handleSuperManagerClick} style={{ marginBottom: "10px" }}>超级管理员</button>
        </div>
    );
}

export default Select;