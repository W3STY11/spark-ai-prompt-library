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
  Building24Regular,
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
  iconCell: {
    fontSize: '24px',
    textAlign: 'center',
  },
  actionButtons: {
    display: 'flex',
    ...shorthands.gap('8px'),
  },
  emojiPicker: {
    fontSize: '32px',
    textAlign: 'center',
    cursor: 'pointer',
    ...shorthands.padding('8px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius('4px'),
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
});

export default function AdminDepartmentsPage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icon: '📁',
    display_order: 999,
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/departments`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
      dispatchToast(
        <Toast>
          <div>Failed to load departments</div>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create department');

      dispatchToast(
        <Toast>
          <div>Department created successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsCreateOpen(false);
      setFormData({ name: '', icon: '📁', display_order: 999 });
      loadDepartments();
    } catch (error) {
      console.error('Failed to create department:', error);
      dispatchToast(
        <Toast>
          <div>Failed to create department</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/departments/${selectedDepartment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update department');

      dispatchToast(
        <Toast>
          <div>Department updated successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsEditOpen(false);
      setSelectedDepartment(null);
      setFormData({ name: '', icon: '📁', display_order: 999 });
      loadDepartments();
    } catch (error) {
      console.error('Failed to update department:', error);
      dispatchToast(
        <Toast>
          <div>Failed to update department</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/departments/${selectedDepartment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete department');

      dispatchToast(
        <Toast>
          <div>Department deleted successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsDeleteOpen(false);
      setSelectedDepartment(null);
      loadDepartments();
    } catch (error) {
      console.error('Failed to delete department:', error);
      dispatchToast(
        <Toast>
          <div>Failed to delete department</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const openEditDialog = (dept) => {
    setSelectedDepartment(dept);
    setFormData({
      name: dept.name,
      icon: dept.icon,
      display_order: dept.display_order,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (dept) => {
    setSelectedDepartment(dept);
    setIsDeleteOpen(true);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner size="huge" label="Loading departments..." />
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
            <Building24Regular />
            <Title1>Department Management</Title1>
          </div>
          <Button
            appearance="primary"
            icon={<Add24Regular />}
            onClick={() => setIsCreateOpen(true)}
          >
            Add Department
          </Button>
        </div>

        <div className={mergeClasses(styles.card, isDark && styles.cardDark)}>
          <Table className={styles.table}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ width: '60px' }}>Icon</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell style={{ width: '120px' }}>Order</TableHeaderCell>
                <TableHeaderCell style={{ width: '200px' }}>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className={styles.iconCell}>{dept.icon}</TableCell>
                  <TableCell>
                    <Title3>{dept.name}</Title3>
                  </TableCell>
                  <TableCell>{dept.display_order}</TableCell>
                  <TableCell>
                    <div className={styles.actionButtons}>
                      <Button
                        size="small"
                        icon={<Edit24Regular />}
                        onClick={() => openEditDialog(dept)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        appearance="subtle"
                        icon={<Delete24Regular />}
                        onClick={() => openDeleteDialog(dept)}
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
            <DialogTitle>Add New Department</DialogTitle>
            <DialogContent>
              <Field label="Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Marketing"
                />
              </Field>
              <Field label="Icon" required style={{ marginTop: '16px' }}>
                <div className={styles.emojiPicker}>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="📢"
                    style={{ textAlign: 'center', fontSize: '24px' }}
                  />
                </div>
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
            <DialogTitle>Edit Department</DialogTitle>
            <DialogContent>
              <Field label="Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field label="Icon" required style={{ marginTop: '16px' }}>
                <div className={styles.emojiPicker}>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    style={{ textAlign: 'center', fontSize: '24px' }}
                  />
                </div>
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
            <DialogTitle>Delete Department</DialogTitle>
            <DialogContent>
              <Body1>
                Are you sure you want to delete <strong>{selectedDepartment?.name}</strong>?
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
