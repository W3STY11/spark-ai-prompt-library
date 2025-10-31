import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config';
import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
  Title1,
  Title3,
  Body1,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Field,
  Spinner,
  Toast,
  Toaster,
  useToastController,
  useId,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Tag24Regular,
} from '@fluentui/react-icons';
import { glass } from '../ui/themeGlass';
import Header from './Header';
import AdminNavigation from './AdminNavigation';

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
  },
  main: {
    maxWidth: '1280px',
    margin: '0 auto',
    ...shorthands.padding('48px', '24px'),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('16px'),
  },
  card: {
    ...glass.card,
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('24px'),
  },
  cardDark: {
    ...glass.cardDark,
  },
  table: {
    width: '100%',
  },
  actionButtons: {
    display: 'flex',
    ...shorthands.gap('8px'),
  },
});

export default function AdminPromptCategoriesPage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    display_order: 1,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/prompt-categories`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load prompt categories:', error);
      dispatchToast(
        <Toast>
          <div>Failed to load prompt categories</div>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/prompt-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create prompt category');

      dispatchToast(
        <Toast>
          <div>Prompt category created successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsCreateOpen(false);
      setFormData({ name: '', display_order: 1 });
      loadCategories();
    } catch (error) {
      console.error('Failed to create prompt category:', error);
      dispatchToast(
        <Toast>
          <div>Failed to create prompt category</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/prompt-categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update prompt category');

      dispatchToast(
        <Toast>
          <div>Prompt category updated successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsEditOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', display_order: 1 });
      loadCategories();
    } catch (error) {
      console.error('Failed to update prompt category:', error);
      dispatchToast(
        <Toast>
          <div>Failed to update prompt category</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/prompt-categories/${selectedCategory.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete prompt category');

      dispatchToast(
        <Toast>
          <div>Prompt category deleted successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsDeleteOpen(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete prompt category:', error);
      dispatchToast(
        <Toast>
          <div>Failed to delete prompt category</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const openEditDialog = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      display_order: category.display_order,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner size="huge" label="Loading prompt categories..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster toasterId={toasterId} />
      <Header isDark={isDark} toggleTheme={toggleTheme} />

      <main className={styles.main}>
        <AdminNavigation />

        <div className={styles.header}>
          <div className={styles.title}>
            <Tag24Regular />
            <Title1>Prompt Category Management</Title1>
          </div>
          <Button
            appearance="primary"
            icon={<Add24Regular />}
            onClick={() => setIsCreateOpen(true)}
          >
            Add Category
          </Button>
        </div>

        <div className={mergeClasses(styles.card, isDark && styles.cardDark)}>
          <Table className={styles.table}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell style={{ width: '120px' }}>Order</TableHeaderCell>
                <TableHeaderCell style={{ width: '200px' }}>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Title3>{category.name}</Title3>
                  </TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    <div className={styles.actionButtons}>
                      <Button
                        size="small"
                        icon={<Edit24Regular />}
                        onClick={() => openEditDialog(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        appearance="subtle"
                        icon={<Delete24Regular />}
                        onClick={() => openDeleteDialog(category)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(_, data) => setIsCreateOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add New Prompt Category</DialogTitle>
            <DialogContent>
              <Field label="Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Understand, Create, Ask..."
                />
              </Field>
              <Field label="Display Order" style={{ marginTop: '16px' }}>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleCreate}>
                Create
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(_, data) => setIsEditOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit Prompt Category</DialogTitle>
            <DialogContent>
              <Field label="Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field label="Display Order" style={{ marginTop: '16px' }}>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleUpdate}>
                Update
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={(_, data) => setIsDeleteOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete Prompt Category</DialogTitle>
            <DialogContent>
              <Body1>
                Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?
                This action cannot be undone.
              </Body1>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleDelete}>
                Delete
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
