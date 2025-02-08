/* import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Button, Table, Alert, Card, Typography, Input } from 'antd';

const { TextArea } = Input;
const { Title } = Typography;

const Judge = () => {
    const [criteria, setCriteria] = useState([]);
    const [projects, setProjects] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    // 模拟评分标准数据
    const mockCriteria = [
        { id: 1, name: '创新性', weight: 30 },
        { id: 2, name: '实用性', weight: 40 },
        { id: 3, name: '技术难度', weight: 30 }
    ];

    // 模拟待评审项目数据
    const mockProjects = [
        { id: 1, name: '项目A' },
        { id: 2, name: '项目B' },
        { id: 3, name: '项目C' }
    ];

    // 模拟评分记录数据
    const mockRatings = [
        {
            id: 1,
            projectName: '项目A',
            createdAt: '2024-10-01 10:00:00',
            totalScore: '85.0'
        },
        {
            id: 2,
            projectName: '项目B',
            createdAt: '2024-10-02 11:30:00',
            totalScore: '78.5'
        }
    ];

    // 获取评分标准和待评审项目
    useEffect(() => {
        const fetchData = async () => {
            // 使用模拟数据代替真实请求
            setCriteria(mockCriteria);
            setProjects(mockProjects);
            setRatings(mockRatings);
        };
        fetchData();
    }, []);

    // 表单提交处理
    const handleSubmit = async (values) => {
        const totalScore = criteria.reduce((sum, criterion) => {
            return sum + (values[criterion.id] * criterion.weight) / 100;
        }, 0);

        // 模拟提交成功的提示
        console.log('模拟提交评分数据：', {
            projectId: selectedProject,
            scores: values,
            comment: values.comment,
            totalScore: totalScore.toFixed(2)
        });

        setSelectedProject(null);
        // 刷新评分记录，这里使用模拟数据更新
        setRatings([
            ...ratings,
            {
                id: ratings.length + 1,
                projectName: projects.find(project => project.id === selectedProject).name,
                createdAt: new Date().toLocaleString(),
                totalScore: totalScore.toFixed(2)
            }
        ]);
    };

    return (
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
                            type={selectedProject === project.id ? 'primary' : 'default'}//三元表达式
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

            <Card title="历史评分记录" style={{ marginTop: 24 }}>
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
                                    onClick={() => console.log(`模拟查看详情：/rating-detail/${record.id}`)}
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
        </div>
    );
};

export default Judge; */

import React, { useState, useEffect } from'react';
import { Form, InputNumber, Button, Table, Alert, Card, Typography, Input } from 'antd';
import axios from 'axios'; // 引入axios用于数据请求

const { TextArea } = Input;
const { Title } = Typography;

// 项目选择组件
const ProjectSelector = ({ projects, onSelect }) => {
    return (
        <Card title="选择评审项目" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {projects.map(project => (
                    <Button
                        key={project.id}
                        type={onSelect.selectedProject === project.id? 'primary' : 'default'}
                        onClick={() => onSelect({ selectedProject: project.id })}
                    >
                        {project.name}
                    </Button>
                ))}
            </div>
        </Card>
    );
};

// 评分表单组件
const RatingForm = ({ criteria, onSubmit, selectedProject }) => {
    return (
        <Card title="评分表单">
            <Form
                layout="vertical"
                onFinish={onSubmit}
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
    );
};

// 评分记录组件
const RatingRecords = ({ ratings, onViewDetail }) => {
    return (
        <Card title="历史评分记录" style={{ marginTop: 24 }}>
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
                                onClick={() => onViewDetail(record.id)}
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
    );
};

const Judge = () => {
    const [criteria, setCriteria] = useState([]);
    const [projects, setProjects] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    // 获取评分标准和待评审项目
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 模拟从后端获取评分标准
                const criteriaResponse = await axios.get('/api/criteria');
                setCriteria(criteriaResponse.data);

                // 模拟从后端获取待评审项目
                const projectsResponse = await axios.get('/api/projects');
                setProjects(projectsResponse.data);

                // 模拟从后端获取评分记录
                const ratingsResponse = await axios.get('/api/ratings');
                setRatings(ratingsResponse.data);
            } catch (error) {
                console.error('数据获取失败', error);
            }
        };
        fetchData();
    }, []);

    // 表单提交处理
    const handleSubmit = async (values) => {
        const totalScore = criteria.reduce((sum, criterion) => {
            return sum + (values[criterion.id] * criterion.weight) / 100;
        }, 0);

        // 模拟提交评分数据到后端
        try {
            const response = await axios.post('/api/submit-rating', {
                projectId: selectedProject,
                scores: values,
                comment: values.comment,
                totalScore: totalScore.toFixed(2)
            });

            // 刷新评分记录
            const newRatingsResponse = await axios.get('/api/ratings');
            setRatings(newRatingsResponse.data);

            setSelectedProject(null);
        } catch (error) {
            console.error('评分提交失败', error);
        }
    };

    const handleViewDetail = (ratingId) => {
        console.log(`模拟查看详情：/rating-detail/${ratingId}`);
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={3}>项目评审面板</Title>
            <Alert
                message="所有评分数据在最终统计前将严格保密"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <ProjectSelector projects={projects} onSelect={{ selectedProject, setSelectedProject }} />

            {selectedProject && (
                <RatingForm criteria={criteria} onSubmit={handleSubmit} selectedProject={selectedProject} />
            )}

            <RatingRecords ratings={ratings} onViewDetail={handleViewDetail} />
        </div>
    );
};

export default Judge;