import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select,
  DatePicker,
  Tag,
  Divider,
  notification,
  Tabs,
  InputNumber 
} from 'antd';
import { UserAddOutlined, SettingOutlined } from '@ant-design/icons';


const { TabPane } = Tabs; // 正确解构 TabPane

const { Option } = Select;
const { RangePicker } = DatePicker;

const SuperManager = () => {
  const [competitionConfig, setCompetitionConfig] = useState({});
  const [admins, setAdmins] = useState([]);
  const [judges, setJudges] = useState([]);
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [currentUserType, setCurrentUserType] = useState('');
  const [form] = Form.useForm();

  // 获取比赛配置
  const fetchCompetitionConfig = async () => {
    try {
      const response = await axios.get('/api/competition/config');
      setCompetitionConfig(response.data);
    } catch (error) {
      notification.error({ message: '获取配置失败' });
    }
  };

  // 获取管理员列表
  const fetchAdmins = async () => {
    try {
      const response = await axios.get('/api/users?role=college_admin');
      setAdmins(response.data);
    } catch (error) {
      notification.error({ message: '获取管理员失败' });
    }
  };

  // 获取评委列表
  const fetchJudges = async () => {
    try {
      const response = await axios.get('/api/users?role=judge');
      setJudges(response.data);
    } catch (error) {
      notification.error({ message: '获取评委失败' });
    }
  };

  useEffect(() => {
    fetchCompetitionConfig();
    fetchAdmins();
    fetchJudges();
  }, []);

  // 处理比赛配置提交
  const handleConfigSubmit = async (values) => {
    try {
      await axios.put('/api/competition/config', {
        ...values,
        timeRange: [values.timeRange[0].toISOString(), values.timeRange[1].toISOString()]
      });
      notification.success({ message: '配置更新成功' });
      setIsConfigModalVisible(false);
      fetchCompetitionConfig();
    } catch (error) {
      notification.error({ message: '配置更新失败' });
    }
  };

  // 创建用户（管理员/评委）
  const handleCreateUser = async (values) => {
    try {
      await axios.post('/api/users', {
        ...values,
        role: currentUserType
      });
      notification.success({ message: '账号创建成功' });
      setIsUserModalVisible(false);
      form.resetFields();
      currentUserType === 'college_admin' ? fetchAdmins() : fetchJudges();
    } catch (error) {
      notification.error({ message: '账号创建失败' });
    }
  };

  // 评分维度管理
  const criteriaColumns = [
    {
      title: '维度名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      render: (text) => `${text}%`,
    },
    {
      title: '评分标准',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  // 用户管理列配置
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
        <Tag color={role === 'college_admin' ? 'volcano' : 'geekblue'}>
          {role === 'college_admin' ? '二级管理员' : '评委'}
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
          onClick={() => handleDeleteUser(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  // 删除用户
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      notification.success({ message: '账号已删除' });
      fetchAdmins();
      fetchJudges();
    } catch (error) {
      notification.error({ message: '删除失败' });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>超级管理控制台</h1>

      {/* 比赛配置区块 */}
      <div style={{ background: '#fafafa', padding: 24, borderRadius: 8 }}>
        <Divider orientation="left">
          <SettingOutlined /> 比赛配置
        </Divider>

        <Button 
          type="primary" 
          onClick={() => setIsConfigModalVisible(true)}
          style={{ marginBottom: 24 }}
        >
          编辑比赛配置
        </Button>

        <Table
          columns={criteriaColumns}
          dataSource={competitionConfig.criteria || []}
          rowKey="name"
          bordered
          pagination={false}
        />
      </div>

      {/* 用户管理区块 */}
      <div style={{ marginTop: 32 }}>
        <Divider orientation="left">
          <UserAddOutlined /> 用户管理
        </Divider>

        <div style={{ marginBottom: 16 }}>
          <Button 
            style={{ marginRight: 16 }}
            onClick={() => {
              setCurrentUserType('college_admin');
              setIsUserModalVisible(true);
            }}
          >
            新建二级管理员
          </Button>
          <Button 
            type="dashed"
            onClick={() => {
              setCurrentUserType('judge');
              setIsUserModalVisible(true);
            }}
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

      {/* 比赛配置模态框 */}
      <Modal
        title="比赛配置"
        width={800}
        visible={isConfigModalVisible}
        onCancel={() => setIsConfigModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={{
            ...competitionConfig,
            timeRange: competitionConfig.timeRange?.map(t => moment(t))
          }}
          onFinish={handleConfigSubmit}
        >
          <Form.Item
            label="比赛名称"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="比赛时间"
            name="timeRange"
            rules={[{ required: true }]}
          >
            <RangePicker showTime />
          </Form.Item>

          <Form.List name="criteria">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      label="维度名称"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="如：创新性" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'weight']}
                      label="权重 (%)"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={1} max={100} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="评分标准"
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>
                    <Button onClick={() => remove(name)}>删除</Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()}>
                  添加评分维度
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit">
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户创建模态框 */}
      <Modal
        title={`新建${currentUserType === 'college_admin' ? '二级管理员' : '评委'}账号`}
        visible={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateUser}>
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
  );
};

export default SuperManager;