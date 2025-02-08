

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, Tag, Collapse } from 'antd';
import { data } from 'react-router-dom';




const { Panel } = Collapse;

const SecondManager = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 获取队伍列表
  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('获取队伍列表失败:', error);
    }
  };

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  // 队伍审核操作
  const handleReview = async (teamId, status) => {
    try {
      await axios.put(`/api/teams/${teamId}/status`, { status });
      fetchTeams(); // 刷新列表
    } catch (error) {
      console.error('审核操作失败:', error);
    }
  };

  // 创建账号
  const handleCreateAccount = async (values) => {
    try {
      await axios.post('/api/users', {
        ...values,
        role: 'team_leader',
        status: 'active'
      });
      fetchUsers();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('创建账号失败:', error);
    }
  };

  // 表格列配置
  const teamColumns = [
    {
      title: '队伍名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
        title:'小队成员',
        dataIndex:'members',
        key:'members',
    },
    {
      title: '所属院系',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '提交状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch (status) {
          case 'pending':
            color = 'orange';
            break;
          case 'approved':
            color = 'green';
            break;
          case 'rejected':
            color = 'red';
            break;
          default:
            color = 'gray';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
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
                onClick={() => handleReview(record.id, 'rejected')}
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

  // 用户列表列配置
  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '权限角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color="blue">{role.toUpperCase()}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>院级管理控制台</h2>
      
       {/* 账号管理区块 */}
      <Collapse defaultActiveKey={['1']}>
        <Panel header="账号管理" key="1">
          <Button 
            type="primary" 
            onClick={() => setIsModalVisible(true)}
            style={{ marginBottom: 16 }}
          >
            新建队长账号
          </Button>
          
          <Table
            columns={userColumns}
            dataSource={users}
            rowKey="id"
            bordered
            pagination={{ pageSize: 5 }}
          />
        </Panel>
      </Collapse>

      {/* 队伍管理区块 */}
      <div style={{ marginTop: 24 }}>
        <h3>参赛队伍管理</h3>
        <Table
          columns={teamColumns}
          dataSource={teams}
          rowKey="id"
          bordered
          pagination={{ pageSize: 8 }}
          expandable={{
            expandedRowRender: record => (
              <div>
                <p><strong>队长:</strong> {record.leader}</p>
                <p><strong>联系方式:</strong> {record.contact}</p>
                <p><strong>材料提交:</strong> 
                  {record.documents?.map(doc => (
                    <Button type="link" key={doc}>{doc}</Button>
                  ))}
                </p>
              </div>
            ),
          }}
        />
      </div>

      {/* 创建账号模态框 */}
      <Modal
        title="新建队长账号"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAccount}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            label="初始密码"
            name="password"
            rules={[{ required: true, message: '请设置初始密码' }]}
          >
            <Input.Password />
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

export default SecondManager;  