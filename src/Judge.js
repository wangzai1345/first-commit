import React, { useState, useEffect } from'react';
import axios from 'axios';
import Mock from'mockjs';
import { Form, InputNumber, Button, Table, Alert, Card, Typography, Input, Modal } from 'antd';
const { TextArea } = Input;
const { Title } = Typography;


const TEST_USERS = [
    { username: '1', password: '1' },
];


let mockRatings = [];
let mockProjects = [];


Mock.mock('/criteria', 'get', () => {
    return [
        { id: 1, name: '创新性', weight: 30 },
        { id: 2, name: '实用性', weight: 30 },
        { id: 3, name: '技术难度', weight: 40 }
    ];
});

Mock.mock('/projects', 'get', () => {
    return [
        { id: 1, name: '项目1' },
        { id: 2, name: '项目2' }
    ];
});

Mock.mock('/ratings', 'get', () => mockRatings);

Mock.mock('/judge', 'post', (options) => {
    const data = JSON.parse(options.body);
    console.log('模拟提交评分数据:', data);
    mockRatings.push({
        id: Mock.mock('@id'),
        projectId: data.projectId,
        scores: data.scores,
        comment: data.comment,
        totalScore: data.totalScore,
        createdAt: new Date().toISOString()
    });
    return {
        success: true,
        errCode: 0,
        errMsg: '',
        data: {}
    };
});

Mock.mock('/judge', 'get', () =>
    mockRatings.map(rating => ({
        id: rating.id,
        projectName: mockProjects.find(p => p.id === rating.projectId)?.name,
        createdAt: rating.createdAt,
        totalScore: rating.totalScore
    }))
);

Mock.mock('/login', 'post', (options) => {
    const { username, password } = JSON.parse(options.body);
    const isAuthenticated = TEST_USERS.some(user => user.username === username && user.password === password);
    if (isAuthenticated) {
        return { success: true };
    } else {
        return { success: false, message: '账号或密码错误' };
    }
});

Mock.mock('/projects', 'get', () => {
    mockProjects = [
        { id: 1, name: '项目1' },
        { id: 2, name: '项目2' }
    ];
    return mockProjects;
});


Mock.mock('/judge', 'patch', (options) => {  //patch?
    const { id, judgeId, workCode, teamId, comId, score, comment } = JSON.parse(options.body);
    const index = mockRatings.findIndex(rating => rating.id === id);
    if (index!== -1) {
        mockRatings[index] = {
           ...mockRatings[index],
            judgeId,
            workCode,
            teamId,
            comId,
            score,
            comment
        };
        return {
            success: true,
            errCode: 0,
            errMsg: '',
            data: {}
        };
    }
    return {
        success: false,
        errCode: 1,
        errMsg: '未找到对应的评分记录',
        data: {}
    };
});

const Judge = () => {
    const [criteria, setCriteria] = useState([]);
    const [projects, setProjects] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginForm] = Form.useForm();
    const [detailVisible, setDetailVisible] = useState(false); 
    const [selectedRating, setSelectedRating] = useState(null); 

    useEffect(() => {
        if (isLoggedIn) {
            const fetchData = async () => {
                try {
                    const criteriaResponse = await axios.get('/criteria');
                    setCriteria(criteriaResponse.data);
                    const projectsResponse = await axios.get('/projects');
                    setProjects(projectsResponse.data);
                    const ratingsResponse = await axios.get('/ratings');
                    setRatings(ratingsResponse.data);
                } catch (error) {
                    console.error('数据获取失败:', error);
                }
            };
            fetchData();
        }
    }, [isLoggedIn]);

    const handleSubmit = async (values) => {
        const totalScore = criteria.reduce((sum, criterion) => {
            return sum + (values[criterion.id] * criterion.weight) / 100;
        }, 0);
        try {
            const response = await axios.post('/judge', {
                projectId: selectedProject,
                scores: values,
                comment: values.comment,
                totalScore: totalScore.toFixed(2)
            });
            console.log('评分数据提交成功:', response.data);
            setSelectedProject(null);
            const updatedRatingsResponse = await axios.get('/judge');
            setRatings(updatedRatingsResponse.data);
        } catch (error) {
            console.error('评分数据提交失败:', error);
        }
    };

    const handleLogin = async (values) => {
       /*  const { username, password } = values; */
        try {
            const response = await axios.post('/login', values);
            if (response.data.success) {
                setIsLoginModalVisible(false);
                setIsLoggedIn(true);
            } else {
                console.error(response.data.message);
            }
        } catch (error) {
            console.error('登录请求失败:', error);
        }
    };

    const handleViewDetail = (rating) => {
        setSelectedRating(rating);
        setDetailVisible(true);
    };

    return (
        <>
            <Modal
                title="登录"
                visible={isLoginModalVisible}
                onCancel={() => { }} 
                footer={null}
            >
                <Form
                    form={loginForm}
                    layout="vertical"
                    onFinish={handleLogin}
                >
                    <Form.Item
                        label="账号"
                        name="username"
                        rules={[{ required: true, message: '请输入账号' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                        登录
                    </Button>
                </Form>
            </Modal>
            {isLoggedIn && (
                <div style={{ padding: 24 }}>
                    <Title level={3}>项目评审面板</Title>
                    <Alert
                        message="所有评分数据在最终统计前将严格保密"
                        type="info"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                    <Card title="选择评审项目" style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            {projects.map(project => (
                                <Button
                                    key={project.id}
                                    type={selectedProject === project.id? 'primary' : 'default'}
                                    onClick={() => setSelectedProject(project.id)}
                                >
                                    {project.name}
                                </Button>
                            ))}
                        </div>
                    </Card>
                    {selectedProject && (
                        <Card title="评分表单">
                            <Form
                                layout="vertical"
                                onFinish={handleSubmit}
                                initialValues={{ comment: '' }}
                            >
                                {criteria.map(criterion => (
                                    <Form.Item
                                        key={criterion.id}
                                        label={`${criterion.name} (权重 ${criterion.weight}%)`}
                                        name={criterion.id}
                                        rules={[{
                                            required: true,
                                            message: '请输入评分'
                        }]}
                                    >
                                <InputNumber
                                            min={0}
                                            max={100}
                                            step={0.1}
                                            style={{ width: '100%' }}
                                            precision={1}
                                        />
                                    </Form.Item>
                                ))}

                             <Form.Item
                                    label="详细评语"
                                    name="comment"
                                    rules={[{ max: 500, message: '评语不超过500字' }]}
                                >
                                    <TextArea rows={4} />
                                </Form.Item>

                                <Button type="primary" htmlType="submit">
                                    提交评分
                                </Button>
                            </Form>
                        </Card>
                    )}

                    <Card title="评分记录" style={{ marginTop: 24 }}>
                        <Table
                            columns={[
                                { title: '项目名称', dataIndex: 'projectName' },
                                { title: '评分时间', dataIndex: 'createdAt' },
                                { title: '总分', dataIndex: 'totalScore' },
                                {
                                    title: '操作',
                                    render: (_, record) => (
                                        <Button
                                            type="link"
                                            onClick={() => handleViewDetail(record)}
                                        >
                                            查看详情
                                        </Button>
                                    )
                                }
                            ]}
                            dataSource={ratings}
                            rowKey="id"
                        />
                    </Card>

                    <Modal
                        title="评分详情"
                        visible={detailVisible}
                        onCancel={() => setDetailVisible(false)}
                        footer={null}
                    >
                        {selectedRating && (
                            <div>
                                <p><strong>项目名称:</strong> {selectedRating.projectName}</p>
                                <p><strong>评分时间:</strong> {selectedRating.createdAt}</p>
                                <p><strong>总分:</strong> {selectedRating.totalScore}</p>
                                <p><strong>评语:</strong> {selectedRating.comment}</p>

                                {/* ! */}
                                <p><strong></strong></p>
                               
                            </div>
                        )}
                    </Modal>
                </div>
            )}
        </>
    );
};

export default Judge;