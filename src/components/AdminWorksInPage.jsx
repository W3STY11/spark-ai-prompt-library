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
  AppGeneric24Regular,
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

export default function AdminWorksInPage({ isDark, toggleTheme }) {
  const styles = useStyles();
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    display_order: 1,
  });

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/works-in`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPlatforms(data);
    } catch (error) {
      console.error('Failed to load Works In platforms:', error);
      dispatchToast(
        <Toast>
          <div>Failed to load Works In platforms</div>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/works-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create Works In platform');

      dispatchToast(
        <Toast>
          <div>Works In platform created successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsCreateOpen(false);
      setFormData({ name: '', display_order: 1 });
      loadPlatforms();
    } catch (error) {
      console.error('Failed to create Works In platform:', error);
      dispatchToast(
        <Toast>
          <div>Failed to create Works In platform</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/works-in/${selectedPlatform.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update Works In platform');

      dispatchToast(
        <Toast>
          <div>Works In platform updated successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsEditOpen(false);
      setSelectedPlatform(null);
      setFormData({ name: '', display_order: 1 });
      loadPlatforms();
    } catch (error) {
      console.error('Failed to update Works In platform:', error);
      dispatchToast(
        <Toast>
          <div>Failed to update Works In platform</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/works-in/${selectedPlatform.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete Works In platform');

      dispatchToast(
        <Toast>
          <div>Works In platform deleted successfully</div>
        </Toast>,
        { intent: 'success' }
      );

      setIsDeleteOpen(false);
      setSelectedPlatform(null);
      loadPlatforms();
    } catch (error) {
      console.error('Failed to delete Works In platform:', error);
      dispatchToast(
        <Toast>
          <div>Failed to delete Works In platform</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const openEditDialog = (platform) => {
    setSelectedPlatform(platform);
    setFormData({
      name: platform.name,
      display_order: platform.display_order,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (platform) => {
    setSelectedPlatform(platform);
    setIsDeleteOpen(true);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spinner size="huge" label="Loading Works In platforms..." />
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
            <AppGeneric24Regular />
            <Title1>Works In Platform Management</Title1>
          </div>
          <Button
            appearance="primary"
            icon={<Add24Regular />}
            onClick={() => setIsCreateOpen(true)}
          >
            Add Platform
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
              {platforms.map((platform) => (
                <TableRow key={platform.id}>
                  <TableCell>
                    <Title3>{platform.name}</Title3>
                  </TableCell>
                  <TableCell>{platform.display_order}</TableCell>
                  <TableCell>
                    <div className={styles.actionButtons}>
                      <Button
                        size="small"
                        icon={<Edit24Regular />}
                        onClick={() => openEditDialog(platform)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        appearance="subtle"
                        icon={<Delete24Regular />}
                        onClick={() => openDeleteDialog(platform)}
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
            <DialogTitle>Add New Works In Platform</DialogTitle>
            <DialogContent>
              <Field label="Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Teams, ChatGPT, Word..."
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
            <DialogTitle>Edit Works In Platform</DialogTitle>
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
            <DialogTitle>Delete Works In Platform</DialogTitle>
            <DialogContent>
              <Body1>
                Are you sure you want to delete <strong>{selectedPlatform?.name}</strong>?
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
