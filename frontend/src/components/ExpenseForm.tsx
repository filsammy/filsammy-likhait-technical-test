/**
 * Form component for adding/editing expenses
 */

import React, { useState, useEffect } from "react";
import { ExpenseFormData } from "../types";
import { TextField, SelectBox, Button, Modal } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { fetchCategories, createCategory } from "../services/api";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit,
    });

  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setCategoryError("Category name cannot be empty");
      return;
    }

    try {
      setIsCreatingCategory(true);
      setCategoryError("");
      const newCategory = await createCategory(newCategoryName);

      // Update categories list and select the new one automatically
      setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      handleChange("category", newCategory.name);

      setIsCategoryModalOpen(false);
      setNewCategoryName("");
    } catch (error) {
      setCategoryError("Failed to create category");
      console.error(error);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const categoryLabelContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px"
  };

  const addCategoryBtnStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#0066cc",
    fontSize: "14px",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline"
  };

  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  return (
    <>
      <form onSubmit={handleSubmit} style={formStyle}>
        <TextField
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          error={errors.amount}
          fullWidth
          required
        />

        <TextField
          label="Description"
          type="text"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
          fullWidth
          required
        />

        <div>
          <div style={categoryLabelContainerStyle}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>Category <span style={{ color: "red" }}>*</span></label>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              style={addCategoryBtnStyle}
            >
              + Add Category
            </button>
          </div>
          <SelectBox
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            error={errors.category}
            fullWidth
            required
            // Note: We bypass the built-in label of SelectBox to use our custom layout
            label=""
          />
        </div>

        <TextField
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          error={errors.date}
          fullWidth
          required
        />

        <div style={buttonGroupStyle}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Add Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setNewCategoryName("");
          setCategoryError("");
        }}
        title="Add New Category"
      >
        <form onSubmit={handleCreateCategory} style={formStyle}>
          <TextField
            label="Category Name"
            type="text"
            placeholder="e.g. Subscriptions"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            error={categoryError}
            fullWidth
            required
          />
          <div style={buttonGroupStyle}>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreatingCategory}
              fullWidth
            >
              {isCreatingCategory ? "Saving..." : "Save Category"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCategoryModalOpen(false);
                setNewCategoryName("");
                setCategoryError("");
              }}
              disabled={isCreatingCategory}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
