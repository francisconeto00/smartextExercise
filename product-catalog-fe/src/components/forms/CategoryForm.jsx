import { TextInput, Button, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";

export default function CategoryForm({
  initialValues = {},
  onSubmit,
  onCancel,
}) {
  const form = useForm({
    initialValues: {
      title: initialValues.title || "",
      description: initialValues.description || "",
    },

    validate: {
      title: (value) => (value ? null : "Title is required."),
    },
  });

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <TextInput label="Title" {...form.getInputProps("title")} />
      <Textarea label="Description" {...form.getInputProps("description")} />

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
