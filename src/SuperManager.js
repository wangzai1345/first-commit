import React, { useState, useEffect } from'react';
import moment from'moment';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Divider, notification, Tabs, InputNumber } from 'antd';
import { UserAddOutlined, SettingOutlined } from '@ant-design/icons';
import Mock from'mockjs';
import axios from 'axios';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;


const TEST_USERS = [
    { username: '1', password: '1', role: '1' },
];


let mockAdmins = [];
let mockJudges = [];

let mockCompetitions = []; 
Mock.mock('/admin/competition', 'get', () => {
    return {
        success: true,
        errCode: 0,
        errMsg: "string",
        data: mockCompetitions
    };
});

Mock.mock('/admin/competition', 'post', (options) => {
    const data = JSON.parse(options.body);
    const newCompetition = {
       ...data,
        id: Date.now(),
        createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    mockCompetitions.push(newCompetition);
    return {
        success: true,
        errCode: 0,
        errMsg: "string",
        data: newCompetition
    };
});
Mock.mock('/admin/academy', 'get', () => (
    {
        success: true,
        errCode: 0,
        errMsg: "string",
        data: mockAdmins 
   }));


Mock.mock('/admin/judge', 'get', () => (
    {   
        success: true,
        errCode: 0,
        errMsg: "string",
         data: mockJudges }));

Mock.mock('/admin/academy', 'post', (options) => {
    const data = JSON.parse(options.body);
    const newAdmin = { ...data, id: Date.now(), role: 'admin' };
    mockAdmins.push(newAdmin);
    return { 
            success: true,
            errCode: 0,
            errMsg: "string",
            data: newAdmin

    };
});


Mock.mock('/admin/judge', 'post', (options) => {
    const data = JSON.parse(options.body);
    const newJudge = { ...data, id: Date.now(), role: 'judge' };
    mockJudges.push(newJudge);
    return {
        success: true,
        errCode: 0,
        errMsg: "string", 
        data: newJudge };
});


let mockCompetitionConfig = [];
Mock.mock('/api/competition', 'get', () => ({ data: mockCompetitionConfig }));

Mock.mock(/\/admin\/academy\/\d+/, 'delete', (options) => {
    const userId = parseInt(options.url.split('/').pop());
    mockAdmins = mockAdmins.filter(admin => admin.id!== userId);
    return { success: true };
});

Mock.mock(/\/admin\/judge\/\d+/, 'delete', (options) => {
    const userId = parseInt(options.url.split('/').pop());
    mockJudges = mockJudges.filter(judge => judge.id!== userId);
    return { success: true };
});

Mock.mock('/api/users', 'post', (options) => {
    const data = JSON.parse(options.body);
    const newUser = {...data, id: Date.now() };
    if (data.role === 'college_admin') {
        mockAdmins.push(newUser);
    } else if (data.role === 'judge') {
        mockJudges.push(newUser);
    }
    return { data: newUser };
});

Mock.mock('/api/login', 'post', (options) => {
    const { username, password } = JSON.parse(options.body);
    const foundUser = TEST_USERS.find(user => user.username === username && user.password === password);
    if (foundUser) {
        return { data: { success: true,
                 role: foundUser.role } };
    } else {
        return { data: { success: false, 
                message: '账号或密码错误' } };
    }
});

const SuperManager = () => {
    const [competitionConfig, setCompetitionConfig] = useState({});
    const [admins, setAdmins] = useState([]);
    const [judges, setJudges] = useState([]);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [isCreateCompetitionModalVisible, setIsCreateCompetitionModalVisible] = useState(false);
    const [competitions, setCompetitions] = useState([]); 
    const [isCreateAdminModalVisible, setIsCreateAdminModalVisible] = useState(false);
    const [isCreateJudgeModalVisible, setIsCreateJudgeModalVisible] = useState(false);
    const [adminForm] = Form.useForm();
    const [judgeForm] = Form.useForm();


    const fetchCompetitionConfig = async () => {
        try {
            const response = await axios.get('/api/competition');
            setCompetitionConfig(response.data.data);
        } catch (error) {
            notification.error({ message: '获取配置失败' });
        }
    };


    const fetchAdmins = async () => {
        try {
            const response = await axios.get('/admin/academy');
            setAdmins(response.data.data);
        } 
        catch (error) {
            notification.error({ message: '获取管理员失败' });
        }
    };
    const fetchJudges = async () => {
        try {
            const response = await axios.get('/admin/judge');
            setJudges(response.data.data);
        } 
        catch (error) {
            notification.error({ message: '获取评委失败' });
        }
    };
    const fetchCompetitions = async () => {
        try {
            const response = await axios.get('/admin/competition');
            if (response.data.success) {
                setCompetitions(response.data.data); 
            }
        } catch (error) {
            notification.error({ message: '获取比赛列表失败' });
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchCompetitionConfig();
            fetchAdmins();
            fetchJudges();
            fetchCompetitions(); 
        }
    }, [isLoggedIn]);

    const handleDeleteUser = async (userId, role) => {
        try {
            const endpoint = role === 'admin'? 'academy' : 'judge';
            await axios.delete(`/admin/${endpoint}/${userId}`);
            notification.success({ message: '账号已删除' });
            role === 'admin'
               ? setAdmins(prev => prev.filter(u => u.id!== userId))
                : setJudges(prev => prev.filter(u => u.id!== userId));
        } 
        catch (error) {
            notification.error({ message: '删除失败' });
        }
    };

    const handleCreateAdmin = async (values) => {
        try {
            const response = await axios.post('/admin/academy', values);
            setAdmins(prev => [...prev, response.data.data]);
            notification.success({ message: '二级管理员创建成功' });
            setIsCreateAdminModalVisible(false);
            adminForm.resetFields();
        } catch (error) {
            notification.error({ message: '创建失败' });
        }
    };

    const handleCreateJudge = async (values) => {
        try {
            const response = await axios.post('/admin/judge', values);
            setJudges(prev => [...prev, response.data.data]);
            notification.success({ message: '评委账号创建成功' });
            setIsCreateJudgeModalVisible(false);
            judgeForm.resetFields();
        } catch (error) {
            notification.error({ message: '评委账号创建失败' });
        }
    };

    const handleCreateCompetitionSubmit = async (values) => {
        try {
            const response = await axios.post('/admin/competition', {
               ...values,
                startTime: values.startTime.format('YYYY-MM-DD HH:mm:ss'),
                endTime: values.endTime.format('YYYY-MM-DD HH:mm:ss'),
                reviewBeginTime: values.reviewBeginTime.format('YYYY-MM-DD HH:mm:ss'),
                reviewEndTime: values.reviewEndTime.format('YYYY-MM-DD HH:mm:ss')
            });
            notification.success({ message: '比赛创建成功' });
            setIsCreateCompetitionModalVisible(false);
            fetchCompetitions(); 
        } catch (error) {
            notification.error({ message: '比赛创建失败' });
        }
    };

    const userColumns = [
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '账号',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin'? 'volcano' : 'geekblue'}>
                    {role === 'admin'? '二级管理员' : '评委'}
                </Tag>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    onClick={() => handleDeleteUser(record.id, record.role)}
                >
                    删除
                </Button>
            ),
        },
    ];

    const competitionColumns = [
        {
            title: '比赛名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '比赛描述',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '最小团队成员数',
            dataIndex:'minTeamMembers',
            key:'minTeamMembers',
        },
        {
            title: '最大团队成员数',
            dataIndex:'maxTeamMembers',
            key:'maxTeamMembers',
        },
        {
            title: '比赛开始时间',
            dataIndex:'startTime',
            key:'startTime',
        },
        {
            title: '比赛结束时间',
            dataIndex: 'endTime',
            key: 'endTime',
        },
        {
            title: '评审开始时间',
            dataIndex:'reviewBeginTime',
            key:'reviewBeginTime',
        },
        {
            title: '评审结束时间',
            dataIndex:'reviewEndTime',
            key:'reviewEndTime',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
        },
    ];

    const handleLogin = async (values) => {
        try {
            const response = await axios.post('/api/login', values);
            const data = response.data.data;
            if (data.success) {
                setIsLoginModalVisible(false);
                setIsLoggedIn(true);
                setUserRole(data.role);
                notification.success({ message: '登录成功' });
            } else {
                notification.error({ message: data.message });
            }
        } catch (error) {
            notification.error({ message: '登录请求失败' });
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
                    <h1>超级管理控制台</h1>
                    <div style={{ marginTop: 16 }}>
                        <Button
                            type="primary"
                            onClick={() => setIsCreateCompetitionModalVisible(true)}
                        >
                            创建比赛
                        </Button>
                    </div>
    
                    <div style={{ marginTop: 32 }}>
                        <Divider orientation="left">比赛列表</Divider>
                        <Table
                            columns={competitionColumns}
                            dataSource={competitions}
                            rowKey="id"
                            bordered
                        />
                    </div>
                    <div style={{ marginTop: 32 }}>
                        <Divider orientation="left">
                            <UserAddOutlined /> 用户管理
                        </Divider>
                        <div style={{ marginBottom: 16 }}>
                            <Button
                                style={{ marginRight: 16 }}
                                onClick={() => setIsCreateAdminModalVisible(true)}
                            >
                                新建二级管理员
                            </Button>
                            <Button
                                type="dashed"
                                onClick={() => setIsCreateJudgeModalVisible(true)}
                            >
                                新建评委账号
                            </Button>
                        </div>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="二级管理员" key="1">
                                <Table
                                    columns={userColumns}
                                    dataSource={admins}
                                    rowKey="id"
                                    bordered
                                />
                            </TabPane>
                            <TabPane tab="评委列表" key="2">
                                <Table
                                    columns={userColumns}
                                    dataSource={judges}
                                    rowKey="id"
                                    bordered
                                />
                            </TabPane>
                        </Tabs>
                    </div>
                    <Modal
                        title="创建比赛"
                        visible={isCreateCompetitionModalVisible}
                        onCancel={() => setIsCreateCompetitionModalVisible(false)}
                        footer={null}
                    >
                        <Form
                            onFinish={handleCreateCompetitionSubmit}
                        >
                            <Form.Item
                                label="比赛名称"
                                name="name"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="比赛描述"
                                name="description"
                                rules={[{ required: true }]}
                            >
                                <Input.TextArea />
                            </Form.Item>
                            <Form.Item
                                label="最小团队成员数"
                                name="minTeamMembers"
                                rules={[{ required: true, type: 'number' }]}
                            >
                                <InputNumber min={1} />
                            </Form.Item>
                            <Form.Item
                                label="最大团队成员数"
                                name="maxTeamMembers"
                                rules={[{ required: true, type: 'number' }]}
                            >
                                <InputNumber min={1} />
                            </Form.Item>
                            <Form.Item
                                label="比赛开始时间"
                                name="startTime"
                                rules={[{ required: true }]}
                            >
                                <DatePicker showTime />
                            </Form.Item>
                            <Form.Item
                                label="比赛结束时间"
                                name="endTime"
                                rules={[{ required: true }]}
                            >
                                <DatePicker showTime />
                            </Form.Item>
                            <Form.Item
                                label="评审开始时间"
                                name="reviewBeginTime"
                                rules={[{ required: true }]}
                            >
                                <DatePicker showTime />
                            </Form.Item>
                            <Form.Item
                                label="评审结束时间"
                                name="reviewEndTime"
                                rules={[{ required: true }]}
                            >
                                <DatePicker showTime />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    创建比赛
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>

                    <Modal
                        title="创建二级管理员账号"
                        visible={isCreateAdminModalVisible}
                        onCancel={() => setIsCreateAdminModalVisible(false)}
                        footer={null}
                    >
                        <Form form={adminForm} onFinish={handleCreateAdmin}>
                            <Form.Item
                                label="姓名"
                                name="name"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="登录账号"
                                name="username"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="初始密码"
                                name="password"
                                rules={[{ required: true }]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                label="联系方式"
                                name="contact"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    创建账号
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                    <Modal
                        title="创建评委账号"
                        visible={isCreateJudgeModalVisible}
                        onCancel={() => setIsCreateJudgeModalVisible(false)}
                        footer={null}
                    >
                        <Form form={judgeForm} onFinish={handleCreateJudge}>
                            <Form.Item
                                label="姓名"
                                name="name"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="登录账号"
                                name="username"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="初始密码"
                                name="password"
                                rules={[{ required: true }]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                label="联系方式"
                                name="contact"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    创建账号
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            )}
        </>
    );
}
export default SuperManager;