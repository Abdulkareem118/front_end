import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);

  const onRegister = (values) => {
    setLoading(true);
    console.log('Registered:', values);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <Title level={3} className="text-center mb-6">Create an Account</Title>
        <Form
          name="register"
          onFinish={onRegister}
          layout="vertical"
          requiredMark={false}
          className="space-y-4"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your full name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
          </Form.Item>

          <Form.Item
            name="terms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms and conditions')),
              },
            ]}
          >
            <Checkbox>
              I agree to the <a href="#">terms and conditions</a>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="rounded-full"
            >
              Register
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
