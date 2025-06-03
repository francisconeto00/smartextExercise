import { TextInput, Textarea, NumberInput, Select, Button } from "@mantine/core";
import { useForm } from "@mantine/form";

export default function ProductForm({ initialValues = {}, categories, onSubmit, onCancel }) {
  const form = useForm({
    initialValues: {
      title: initialValues.title || "",
      description: initialValues.description || "",
      price: initialValues.price || 0,
      categoryId: initialValues.category?.id?.toString() || "",
    },

    validate: {
      title: (value) => (value ? null : "Title is required."),
      price: (value) => (value > 0 ? null : "Price must be bigger than 0."),
      categoryId: (value) => (value ? null : "A category is required."),
    },
  });

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col gap-4">
      <TextInput label="Title" {...form.getInputProps("title")} />
      <Textarea label="Description" {...form.getInputProps("description")} />
      <NumberInput label="Price (€)" min={0} precision={2} {...form.getInputProps("price")} />
      <Select
        label="Categoria"
        data={categories}
        {...form.getInputProps("categoryId")}
      />
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="default" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
