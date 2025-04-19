import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Typography, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import Logo from "../Images/sunset.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://pos-2-wv56.onrender.com/api/users/login",
        {
          email: values.email,
          password: values.password,
        }
      );

      console.log("Login success:", response.data);
      message.success("Login successful!");
      localStorage.setItem("token", response.data.token);

      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      message.error(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md text-center">
        {/* Hotel Logo/Image */}
        <img src={Logo} alt="Hotel Logo" className="img-fluid w-50" />

        {/* Welcome Text */}
        <Title level={3} className="mb-1">
          Welcome
        </Title>

        <Text
          type="secondary"
          className="block mb-6 text-lg"
          style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: "28px",
            color: "#333",
          }}
        >
          The Sunset Café
        </Text>

        <Form
          name="login"
          onFinish={onLogin}
          layout="vertical"
          requiredMark={false}
          className="space-y-4 text-left"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="rounded-full"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
