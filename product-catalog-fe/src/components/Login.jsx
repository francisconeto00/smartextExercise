import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, TextInput, Text, Stack } from "@mantine/core";
import { login } from "../services/auth";
export default function Login() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;

    try {
      await login(username, password);
      navigate("/products");
    } catch (error) {
      console.error("Error", error.message);
      setError(error.message || "An error has occurred");
    }
  };

  return (
    <Card shadow="none" padding="0" maw={400} mx="auto" mt="xl">
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Username"
            name="username"
            placeholder="Enter your username"
            required
          />

          <TextInput
            label="Password"
            name="password"
            placeholder="Enter your password"
            type="password"
            required
          />

          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}

          <Button type="submit" fullWidth>
            Login
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
