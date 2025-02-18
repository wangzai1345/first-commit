import React, { useState } from 'react';
import axios from 'axios';
import Mock from 'mockjs';
import { Table, Button, Input, Form, Modal, message } from 'antd';
import './Captain.css';

Mock.mock('http://localhost:5000/upload', 'post', () => {
    return {
        path: '/mock/path/to/file.pdf'
    };
});

Mock.mock('/login', 'post', (options) => {
    const { username, password } = JSON.parse(options.body);
    const TEST_USERNAME = '1';
    const TEST_PASSWORD = '1';
    if (username === TEST_USERNAME && password === TEST_PASSWORD) {
        return {
            success: true,
            errCode: 0,
            errMsg: "string",
            data: {
                username,
                password,
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            }
        };
    } else {
        return {
            success: false,
            message: '账号或密码错误'
        };
    }
});


Mock.mock('/captain/team', 'post', (options) => {
    const { teamName, members } = JSON.parse(options.body);
    return {
        success: true,
        errCode: 0,
        errMsg: "string",
        data: {
            id: Date.now().toString(), 
            comId: 0,
            name: teamName,
            captainId: 0,
            captainName: "队长姓名",
            status: 0,
            memberNames: members.map(member => member.name).join(", "),
            instructorNames: "指导教师姓名"
        }
    };
});

Mock.mock(/\/captain\/team\/\d+\/member/, 'post', (options) => {
    const teamId = options.url.match(/\/captain\/team\/(\d+)\/member/)[1];
    const { name, id, college, phonenumber } = JSON.parse(options.body);
    return {
        success: true,
        errCode: 0,
        errMsg: "string",
        data: {
            id: Date.now().toString(), // 模拟成员 ID 为字符串
            teamId: parseInt(teamId, 10),
            name,
            phonenumber,
            college
        }
    };
});

Mock.mock(/\/captain\/team\/\d+\/member\/[^/]+/, 'delete', (options) => {
    const [, currentTeamId, memberId] = options.url.match(/\/captain\/team\/(\d+)\/member\/([^/]+)/);
    return {
        success: true,
        errCode: 0,
        errMsg: "string",
        data: {}
    };
});

Mock.mock(/\/captain\/team\/\d+\/member/, 'patch', (options) => {
    const teamId = options.url.match(/\/captain\/team\/(\d+)\/member/)[1];
    const { name, id, college, phonenumber } = JSON.parse(options.body);
    return {
        success: true,
        errCode: 0,
        errMsg: "string",
        data: {
            id: Date.now().toString(),
            teamId: parseInt(teamId, 10),
            name,
            phonenumber,
            college
        }
    };
});


Mock.mock(/\/captain\/team\/\d+\/member/, 'get', (options) => {
    const teamId = options.url.match(/\/captain\/team\/(\d+)\/member/)[1];
    return {
        success: true,
        errCode: 0,
        errMsg: "string",
        data: [
            {
                id: Date.now().toString(), 
                teamId: parseInt(teamId, 10),
                name: "成员姓名",
                phonenumber: "1xxxxxxxxxx",
                college: "学院名称"
            }
        ]
    };
});

const Captain = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [dataSource, setDataSource] = useState([
        {
            key: '1',
            name: '队长姓名',
            id: 'xxxxxxxxx',
            college: '学院名称',
            phonenumber: '1xxxxxxxxxx',
        },
    ]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
    ];
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(true);
    const [loginForm] = Form.useForm();
    const [createTeamTime, setCreateTeamTime] = useState(''); 
    const [currentTeamId, setCurrentTeamId] = useState(null); 

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && allowedTypes.includes(file.type)) {
            setSelectedFile(file);
            setUploadStatus('');
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewUrl(event.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setUploadStatus('仅支持 PPT/PDF/Word/图片 文件！');
            setSelectedFile(null);
            setPreviewUrl('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadStatus('请先选择文件！');
            return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadStatus(`上传成功！路径：${response.data.path}`);
        } catch (error) {
            setUploadStatus('上传失败：' + error.message);
        }
    };

    const addRow = async () => {
        if (!currentTeamId) {
            message.error('请先创建队伍');
            return;
        }
        try {
            const newKey = Date.now().toString();
            const newMember = {
                key: newKey,
                name: '未命名',
                id: '无学号',
                college: '学院名称',
                phonenumber: '1xxxxxxxxxx'
            };
            const response = await axios.post(`/captain/team/${currentTeamId}/member`, newMember);
            if (response.data.success) {
                setDataSource([...dataSource, newMember]);
                message.success('添加成功');
            } else {
                message.error('添加失败，接口返回错误');
            }
        } catch (error) {
            message.error('添加失败：' + error.message);
        }
    };

    const deleteRow = async (key) => {
        try {
            const memberToDelete = dataSource.find(item => item.key === key);
            if (!memberToDelete) {
                message.error('未找到要删除的成员');
                return;
            }

            const memberId = memberToDelete.id; 
            const response = await axios.delete(`/captain/team/${currentTeamId}/member/${memberId}`);

            if (response.data.success) {
                setDataSource(dataSource.filter(item => item.key !== key));
                message.success('删除成功');
            } else {
                message.error('删除失败，接口返回错误');
            }
        } catch (error) {
            message.error('删除失败：' + error.message);
        }
    };

    const editRow = (record) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setIsEditModalVisible(true);
    };

    const onFinish = async (values) => {
        try {
            const memberId = editingRecord.id;
            const response = await axios.patch(`/captain/team/${currentTeamId}/member`, values);
            if (response.data.success) {
                const newDataSource = dataSource.map(item => {
                    if (item.key === editingRecord.key) {
                        return {
                            ...item,
                            ...values,
                        };
                    }
                    return item;
                });
                setDataSource(newDataSource);
                form.resetFields();
                setIsEditModalVisible(false);
                message.success('信息修改成功');
            } else {
                message.error('修改失败，接口返回错误');
            }
        } catch (error) {
            message.error('修改失败：' + error.message);
        }
    };

    const handleCreateTeam = async () => {
        try {
            const response = await axios.post('/captain/team', {
                teamName: '默认队伍名称',
                members: dataSource
            });
            if (response.data.success) {
                const currentTime = new Date().toLocaleString();
                setCreateTeamTime(currentTime);
                setCurrentTeamId(response.data.data.id); 
                message.success(`队伍创建成功，时间：${currentTime}`);
            } else {
                message.error('队伍创建失败，接口返回错误');
            }
        } catch (error) {
            message.error('队伍创建失败：' + error.message);
        }
    };

     const getTeamMembers = async (teamId) => {
        try {
            const response = await axios.get(`/captain/team/${teamId}/member`);
            if (response.data.success) {
                setDataSource(response.data.data.map(item => ({
                    key: item.id,
                    name: item.name,
                    id: item.id,
                    college: item.college,
                    phonenumber: item.phonenumber
                })));
            } else {
                message.error('获取队伍成员失败，接口返回错误');
            }
        } catch (error) {
            message.error('获取队伍成员失败：' + error.message);
        }
    };

       const changeTeamMembers = async (teamId) => {
        try {
            const response = await axios.patch(`/captain/team/${teamId}/member`);
            if (response.data.success) {
                setDataSource(response.data.data.map(item => ({
                    key: item.id,
                    name: item.name,
                    id: item.id,
                    college: item.college,
                    phonenumber: item.phonenumber
                })));
            } else {
                message.error('修改队伍成员失败，接口返回错误');
            }
        } catch (error) {
            message.error('修改队伍成员失败：' + error.message);
        }
    }; 

    const getPreviewElement = () => {
        if (!previewUrl) return null;
        if (selectedFile.type.startsWith('image/')) {
            return <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px' }} />;
        } else if (selectedFile.type === 'application/pdf') {
            return <embed src={previewUrl} type="application/pdf" style={{ width: '100%', height: '600px', marginTop: '10px' }} />;
        } else if (
            selectedFile.type === 'application/vnd.ms-powerpoint' ||
            selectedFile.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
            selectedFile.type === 'application/msword' ||
            selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            const officePreviewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`;
            return <iframe src={officePreviewUrl} style={{ width: '100%', height: '600px', marginTop: '10px' }}></iframe>;
        }
        return null;
    };

    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '学号',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '学院',
            dataIndex: 'college',
            key: 'college',
        },
        {
            title: '联系方式',
            dataIndex: 'phonenumber',
            key: 'phonenumber',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <div>
                    <Button type="link" onClick={() => editRow(record)}>
                        编辑
                    </Button>
                    <Button type="link" danger onClick={() => deleteRow(record.key)}>
                        删除
                    </Button>
                </div>
            ),
        },
    ];

    const handleLogin = async (values) => {
        try {
            const response = await axios.post('/login', values);
            if (response.data.success) {
                setIsLoginModalVisible(false);
                message.success('登录成功');
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
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
            <div>
                <style>
                    {`
                        table {
                            margin-top: 20px;
                            width: 100%;
                            border-collapse: collapse;
                        }
                        th, td {
                            border: 1px solid black;
                            padding: 8px;
                            text-align: center;
                        }
                        button {
                            margin-left: 5px;
                        }
                        th {
                            background-color: #ddd;
                        }
                        label {
                            margin-right: 5px;
                        }
                        input {
                            margin-right: 5px;
                        }
                    `}
                </style>
                <Form form={form} layout="inline">
                    <Form.Item label="队伍名称" name="teamName">
                        <Input placeholder="请输入队伍名称" />
                    </Form.Item>
                    <Form.Item>
                        <Button id="add" onClick={addRow}>
                            添加新成员信息
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button id="createTeam" onClick={handleCreateTeam}>
                            创建队伍
                        </Button>
                    </Form.Item>
                </Form>
                <span>队伍创建时间：{createTeamTime}</span>
                <Table columns={columns} dataSource={dataSource} />
                <div
                    style={{
                        marginTop: '20px',
                        padding: '20px',
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                    }}
                >
                    <h3>请在此处上传您的附件</h3>
                    <input
                        type="file"
                        onChange={handleFileSelect}
                        style={{ display: 'block', margin: '10px 0' }}
                    />
                    <Button
                        onClick={handleUpload}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        提交文件
                    </Button>
                    {uploadStatus && (
                        <p
                            style={{
                                marginTop: '10px',
                                color: uploadStatus.includes('成功') ? 'green' : 'red',
                            }}
                        >
                            {uploadStatus}
                        </p>
                    )}
                    {selectedFile && (
                        <div style={{ marginTop: '10px' }}>
                            <p>文件名：{selectedFile.name}</p>
                            <p>文件类型：{selectedFile.type}</p>
                            <p>文件大小：{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                    )}
                    {getPreviewElement()}
                </div>
                <Modal
                    title="修改成员信息"
                    visible={isEditModalVisible}
                    onCancel={() => {
                        setIsEditModalVisible(false);
                        form.resetFields();
                    }}
                    footer={[
                        <Button key="cancel" onClick={() => {
                            setIsEditModalVisible(false);
                            form.resetFields();
                        }}>
                            取消
                        </Button>,
                        <Button key="save" type="primary" onClick={() => form.submit()}>
                            保存修改
                        </Button>,
                    ]}
                >
                    <Form
                        form={form}
                        name="editForm"
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={editingRecord}
                        validateTrigger={['onChange', 'onBlur']}
                    >
                        <Form.Item
                            label="姓名"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入姓名',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="学号"
                            name="id"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入学号',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="学院"
                            name="college"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入学院',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="联系方式"
                            name="phonenumber"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入联系方式',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </>
    );
};

export default Captain;
