import { Tabs } from '@mantine/core';
import Login from '../components/Login';
import Register from '../components/Register';


export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Tabs
        defaultValue="login"
        variant="outline"
        radius="md"
        className="w-full max-w-md"
      >
        <Tabs.List grow>
          <Tabs.Tab
            value="login"
          >
            Login
          </Tabs.Tab>
          <Tabs.Tab
            value="register"
          >
            Register
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="login" pt="md">
          <Login />
        </Tabs.Panel>

        <Tabs.Panel value="register" pt="md">

          <Register />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
