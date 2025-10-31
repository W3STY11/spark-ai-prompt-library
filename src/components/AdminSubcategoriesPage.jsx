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
  Select,
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
  Folder24Regular,
} from '@fluentui/react-icons';
import { glass } from '../ui/themeGlass';
import Header from './Header';

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

export default function AdminSubcategoriesPage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [subcategories, setSubcategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    department_name: '',
    display_order: 999,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load departments for dropdown
      const deptsResponse = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/departments`);
      if (deptsResponse.ok) {
        const deptsData = await deptsResponse.json();
        setDepartments(deptsData);
      }

      // Load subcategories
      const subcatsResponse = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/subcategories`);
      if (!subcatsResponse.ok) throw new Error(`HTTP error! status: ${subcatsResponse.status}`);
      const subcatsData = await subcatsResponse.json();
      setSubcategories(subcatsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      dispatchToast(
        <Toast>
          <div>Failed to load subcategories</div>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create subcategory');

      dispatchToast(
        <Toast>
          <div>Subcategory created successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsCreateOpen(false);
      setFormData({ name: '', department_name: '', display_order: 999 });
      loadData();
    } catch (error) {
      console.error('Failed to create subcategory:', error);
      dispatchToast(
        <Toast>
          <div>Failed to create subcategory</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/subcategories/${selectedSubcategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update subcategory');

      dispatchToast(
        <Toast>
          <div>Subcategory updated successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsEditOpen(false);
      setSelectedSubcategory(null);
      setFormData({ name: '', department_name: '', display_order: 999 });
      loadData();
    } catch (error) {
      console.error('Failed to update subcategory:', error);
      dispatchToast(
        <Toast>
          <div>Failed to update subcategory</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/subcategories/${selectedSubcategory.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subcategory');

      dispatchToast(
        <Toast>
          <div>Subcategory deleted successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsDeleteOpen(false);
      setSelectedSubcategory(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete subcategory:', error);
      dispatchToast(
        <Toast>
          <div>Failed to delete subcategory</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const openEditDialog = (subcat) => {
    setSelectedSubcategory(subcat);
    setFormData({
      name: subcat.name,
      department_name: subcat.department_name,
      display_order: subcat.display_order,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (subcat) => {
    setSelectedSubcategory(subcat);
    setIsDeleteOpen(true);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner size="huge" label="Loading subcategories..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster toasterId={toasterId} />
      <Header isDark={isDark} toggleTheme={toggleTheme} />

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Folder24Regular />
            <Title1>Subcategory Management</Title1>
          </div>
          <Button
            appearance="primary"
            icon={<Add24Regular />}
            onClick={() => setIsCreateOpen(true)}
          >
            Add Subcategory
          </Button>
        </div>

        <div className={mergeClasses(styles.card, isDark && styles.cardDark)}>
          <Table className={styles.table}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Department</TableHeaderCell>
                <TableHeaderCell style={{ width: '120px' }}>Order</TableHeaderCell>
                <TableHeaderCell style={{ width: '200px' }}>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories.map((subcat) => (
                <TableRow key={subcat.id}>
                  <TableCell>
                    <Title3>{subcat.name}</Title3>
                  </TableCell>
                  <TableCell>{subcat.department_name}</TableCell>
                  <TableCell>{subcat.display_order}</TableCell>
                  <TableCell>
                    <div className={styles.actionButtons}>
                      <Button
                        size="small"
                        icon={<Edit24Regular />}
                        onClick={() => openEditDialog(subcat)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        appearance="subtle"
                        icon={<Delete24Regular />}
                        onClick={() => openDeleteDialog(subcat)}
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
            <DialogTitle>Add New Subcategory</DialogTitle>
            <DialogContent>
              <Field label="Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Email Campaigns"
                />
              </Field>
              <Field label="Department" required style={{ marginTop: '16px' }}>
                <Select
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.icon} {dept.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Display Order" style={{ marginTop: '16px' }}>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 999 })}
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
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogContent>
              <Field label="Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field label="Department" required style={{ marginTop: '16px' }}>
                <Select
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.icon} {dept.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Display Order" style={{ marginTop: '16px' }}>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 999 })}
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
            <DialogTitle>Delete Subcategory</DialogTitle>
            <DialogContent>
              <Body1>
                Are you sure you want to delete <strong>{selectedSubcategory?.name}</strong>?
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
