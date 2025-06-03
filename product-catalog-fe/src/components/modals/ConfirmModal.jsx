import React from "react";
import { Modal, Button, Text, Group } from "@mantine/core";

export default function ConfirmModal({ opened, onConfirm, onCancel, message }) {
  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title="Are you sure?"
      centered
      size="xs"
      withCloseButton={false}
      lockScroll={true}
    >
      <Text size="sm" c="dimmed" mb="md">
        {message}
      </Text>

      <Group position="apart" spacing="md">
        <Button color="gray" variant="outline" onClick={onCancel} fullWidth>
          Cancel
        </Button>

        <Button color="red" onClick={onConfirm} fullWidth>
          Yes
        </Button>
      </Group>
    </Modal>
  );
}
