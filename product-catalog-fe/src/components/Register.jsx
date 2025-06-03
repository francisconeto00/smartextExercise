import { useState } from "react";
import { Button, Card, TextInput, Text, Stack } from "@mantine/core";
import { register } from "../services/auth"
import { useNavigate } from "react-router-dom";
export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const  handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;

    console.log("Username:", username);
    console.log("Password:", password);
    try {
      const data = await register(username, password);
      console.log(data);
      navigate("/products");
    } catch (error) {
      setError(error.message || "An error has occurred");
    }

  };

  return (
    <Card shadow="none" padding="0"  maw={400} mx="auto" mt="xl">
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
            Sign In
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
