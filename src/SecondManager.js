import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Mock from 'mockjs';
import { Table, Button, Modal, Form, Input, Tag, Collapse, message } from 'antd';

const { Panel } = Collapse;

// 模拟用
const TEST_USERS = [
    { username: '1', password: '1' },
];


let mockLeaders = [
    {
        id: 1,
        username: 'captain1',
        email: 'ggbond@njupt.edu.cn',
        createdAt: new Date().toISOString(),
        role: 'Captain',
        status: 'active'
    },
    {
        id: 2,
        username: 'captain2',
        email: 'ggbond@njupt.edu.cn',
        createdAt: new Date().toISOString(),
        role: 'Captain',
        status: 'active'
    }
];

let mockTeams = [
    {
        id: 1,
        name: '队伍1',
        members: '成员1,成员2',
        department: '院系1',
        leader: '队长1',
        contact: '123456789',
        documents: [
            { name: '文档1', url: 'https://1234567.com/document.pdf' }
        ],
        status: 'pending'
    },
    {
        id: 2,
        name: '队伍2',
        members: '成员3,成员4',
        department: '院系2',
        leader: '队长2',
        contact: '987654321',
        documents: [],
        status: 'approved'
    }
];


Mock.mock('/academy/team', 'get', () => {
    return {
        success: true,
        errCode: 0,
        errMsg: '',
        data: mockTeams
    };
});




Mock.mock('http://localhost:63342/academy/team', 'get', () => {
    return mockLeaders;
});


Mock.mock(/\/api\/teams\/\d+\/status/, 'put', () => {
    return { success: true };
});


Mock.mock('http://localhost:63342/academy/captain', 'post', (options) => {
    const data = JSON.parse(options.body);
    const newLeader = {
        id: Mock.mock('@id'),
        username: data.username,
        email: data.email,
        role: 'team_leader',
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    mockLeaders.push(newLeader); 
    return {
        success: true,
        errCode: 0,
        errMsg: '',
        data: newLeader
    };
});

let mockJudges = [];

Mock.mock('/academy/judge', 'post', (options) => {
    const data = JSON.parse(options.body);
    const newJudge = {
        id: Mock.mock('@id'),
        username: data.username,
        email: data.email,
        role: 'judge',
        status: 'active',
        createdAt: new Date().toISOString()
    };
    mockJudges.push(newJudge);
    return {
        success: true,
        errCode: 0,
        errMsg: '',
        data: {}
    };
});


Mock.mock('/academy/judge', 'delete', (options) => {
    const { id } = JSON.parse(options.body);
    mockJudges = mockJudges.filter(judge => judge.id!== id);
    return {
        success: true,
        errCode: 0,
        errMsg: '',
        data: {}
    };
});


Mock.mock('/academy/judge', 'get', () => {
    return {
        success: true,
        errCode: 0,
        errMsg: '',
        data: mockJudges
    };
});
Mock.mock('/api/teams', 'get', () => {
    return mockTeams;
});


Mock.mock('/api/login', 'post', (options) => {
    const { username, password } = JSON.parse(options.body);
    const isAuthenticated = TEST_USERS.some(user => user.username === username && user.password === password);
    if (isAuthenticated) {
        return { success: true };
    } else {
        return { success: false, message: '账号或密码错误' };
    }
});

const SecondManager = () => {
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginForm] = Form.useForm();

    const fetchTeams = async () => {
        try {
            const { data } = await axios.get('/api/teams');
            setTeams(data.map(team => ({
               ...team,
                hasMaterials: team.documents?.length > 0
            })));
            message.success('队伍数据已更新');
        } catch (error) {
             message.error('获取队伍数据失败');
            console.error('fetchTeams error:', error); 
        }
    };

    const fetchLeaders = async () => {
        try {
            const { data } = await axios.get('http://localhost:63342/academy/team');
            setUsers(data);
        } catch (error) {
            message.error('获取账号列表失败');
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchTeams();
            fetchLeaders();
        }
    }, [isLoggedIn]);

    const handleReview = async (teamId, status) => {
        try {
            await axios.put(`/api/teams/${teamId}/status`, { status });
            fetchTeams();
        } catch (error) {
            console.error('审核操作失败:', error);
            message.error('审核操作失败');
        }
    };

    const handleCreateAccount = async (values) => {
        try {
            const response = await axios.post('http://localhost:63342/academy/captain', {
               ...values,
                role: 'Captain',
                status: 'active'
            });
            const newUser = response.data.data;
            setUsers([...users, newUser]);
            setIsModalVisible(false);
            form.resetFields();
            message.success('账号创建成功');
            fetchLeaders();
        } catch (error) {
            console.error('创建账号失败:', error);
            message.error('账号创建失败');
        }
    };

    const teamColumns = [
        {
            title: '队伍名称',
            dataIndex: 'name',
            key: 'name',
            width: 150,
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            title: '小队成员',
            dataIndex:'members',
            key:'members',
        },
        {
            title: '所属院系',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: '材料状态',
            dataIndex: 'hasMaterials',
            key:'materials',
            render: (has) => (
                <Tag color={has? 'green' :'red'}>
                    {has? '已提交' : '未提交'}
                </Tag>
            ),
            width: 100
        },
        {
            title: '审核状态',
            dataIndex:'status',
            key:'status',
            render: (status) => {
                const statusConfig = {
                    pending: { color: 'orange', text: '待审核' },
                    approved: { color: 'green', text: '已通过' },
                    rejected: { color:'red', text: '已驳回' }
                };
                return <Tag color={statusConfig[status].color}>{statusConfig[status].text}</Tag>;
            },
            width: 100
        },
        {
            title: '操作',
            key: 'actions',
            render: (_, record) => (
                <div>
                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="link"
                                onClick={() => handleReview(record.id, 'approved')}
                            >
                                通过
                            </Button>
                            <Button
                                type="link"
                                danger
                                onClick={() => handleReview(record.id,'rejected')}
                            >
                                拒绝
                            </Button>
                        </>
                    )}
                    <Button type="link">查看详情</Button>
                </div>
            ),
        },
    ];
    const userColumns = [
        {
            title: '账号名称',
            dataIndex: 'username',
            key: 'username',
            width: 150
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleString(),
            width: 180
        },
        {
            title: '权限角色',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color="blue">{role.toUpperCase()}</Tag>,
        },
        {
            title: '状态',
            dataIndex:'status',
            key:'status',
            render: (status) => (
                <Tag color={status === 'active'? 'green' : 'volcano'}>
                    {status.toUpperCase()}
                </Tag>
            ),
            width: 100
        }
    ];

    const handleLogin = async (values) => {
        const { username, password } = values;
        if (TEST_USERS.some(user => user.username === username && user.password === password)) {
            setIsLoginModalVisible(false);
            setIsLoggedIn(true);
        } else {
            console.error('账号或密码错误');
            message.error('账号或密码错误');
        }

        try {
            const response = await axios.post('/api/login', values);
            if (response.data.success) {
                setIsLoginModalVisible(false);
                setIsLoggedIn(true);
            } else {
                console.error(response.data.message);
                message.error(response.data.message);
            }
        } catch (error) {
            console.error('登录请求失败:', error);
            message.error('登录请求失败');
        }
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
                    <h2>院级赛事管理系统</h2>

                    <Collapse ghost>
                        <Panel header="队长账号管理" key="users">
                            <div style={{ marginBottom: 16 }}>
                                <Button
                                    type="primary"
                                    onClick={() => setIsModalVisible(true)}
                                >
                                    新建账号
                                </Button>
                                <Button
                                    style={{ marginLeft: 8 }}
                                    onClick={fetchLeaders}
                                >
                                    刷新列表
                                </Button>
                            </div>
                            <Table
                                columns={userColumns}
                                dataSource={users}
                                rowKey="id"
                                bordered
                                scroll={{ x: 800 }}
                                pagination={{ pageSize: 5 }}
                            />
                        </Panel>
                    </Collapse>

                    <div style={{ marginTop: 24 }}>
                        <Collapse ghost defaultActiveKey="teams">
                            <Panel header="参赛队伍管理" key="teams">
                                <div style={{ marginBottom: 16 }}>
                                    <Button onClick={fetchTeams}>
                                        刷新队伍
                                    </Button>
                                </div>
                                <Table
                                    columns={teamColumns}
                                    dataSource={teams}
                                    rowKey="id"
                                    bordered
                                    scroll={{ x: 1200 }}
                                    expandable={{
                                        expandedRowRender: (record) => (
                                            <div style={{ padding: 16 }}>
                                                <p><strong>队长:</strong> {record.leader}</p>
                                                <p><strong>联系方式:</strong> {record.contact}</p>
                                                <p><strong>材料提交:</strong>
                                                    {record.documents?.length > 0? (
                                                        record.documents.map((doc, i) => (
                                                            <Button
                                                                key={i}
                                                                type="link"
                                                                onClick={() => window.open(doc.url)}
                                                            >
                                                                {doc.name}
                                                            </Button>
                                                        ))
                                                    ) : '无'}
                                                </p>
                                            </div>
                                        )
                                    }}
                                />
                            </Panel>
                        </Collapse>
                    </div>

                    <Modal
                        title="新建队长账号"
                        visible={isModalVisible}
                        onCancel={() => setIsModalVisible(false)}
                        footer={null}
                        destroyOnClose
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleCreateAccount}
                        >
                            <Form.Item
                                label="登录账号"
                                name="username"
                                rules={[
                                    { required: true, message: '请输入账号' },


                                    { pattern: /^[a-zA-Z0-9_]{4,16}$/, message: '4 - 16位字母数字或下划线' }
                                ]}
                            >
                                <Input placeholder="设置登录用户名" />
                            </Form.Item>

                            <Form.Item
                                label="登录密码"
                                name="password"
                                rules={[
                                    { required: true, message: '请输入密码' },
                                    { min: 6, message: '至少6位字符' }
                                ]}
                            >
                                <Input.Password placeholder="设置初始密码" />
                            </Form.Item>

                            <Form.Item
                                label="联系邮箱"
                                name="email"
                                rules={[
                                    { required: true, message: '请输入邮箱' },
                                    { type: 'email', message: '邮箱格式不正确' }
                                ]}
                            >
                                <Input placeholder="用于接收通知" />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                            >
                                立即创建
                            </Button>
                        </Form>
                    </Modal>
                </div>
            )}
        </>
    );
};

export default SecondManager;