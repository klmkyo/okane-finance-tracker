'use client'

import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [form] = Form.useForm();

  const onFinish = (values: RegisterFormValues) => {
    console.log('Success:', values);
    message.success('Registration successful!');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card title="Register" className="w-full max-w-md">
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!', whitespace: true }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { type: 'email', message: 'The input is not valid E-mail!' },
              { required: true, message: 'Please input your E-mail!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters long' }
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Register
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center mt-4">
          Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login now!</Link>
        </div>
      </Card>
    </div>
  );
}

