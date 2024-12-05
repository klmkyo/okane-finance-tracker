'use client'

import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface LoginFormValues {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [form] = Form.useForm();

  const onFinish = (values: LoginFormValues) => {
    console.log('Success:', values);
    message.success('Login successful!');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card title="Login" className="w-full max-w-md">
        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Log in
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center mt-4">
          Don't have an account? <Link href="/register" className="text-blue-500 hover:underline">Register now!</Link>
        </div>
      </Card>
    </div>
  );
}

