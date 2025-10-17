import React, { useState } from 'react';
import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
  Title2,
  Title3,
  Body1,
  Body2,
  Button,
  Badge,
  Card,
  Textarea,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Toast,
  useToastController,
  useId,
} from '@fluentui/react-components';
import {
  Checkmark24Regular,
  Dismiss24Regular,
  Eye24Regular,
  Calendar24Regular,
} from '@fluentui/react-icons';
import { glass } from '../ui/themeGlass';

const useStyles = makeStyles({
  section: {
    marginBottom: '32px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  badge: {
    marginLeft: '12px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    ...shorthands.gap('20px'),
  },
  promptCard: {
    ...shorthands.padding('20px'),
    ...glass.card,
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
  },
  promptCardDark: {
    ...glass.cardDark,
  },
  pendingBadge: {
    background: tokens.colorPaletteYellowBackground2,
    color: tokens.colorPaletteYellowForeground1,
  },
  promptHeader: {
    display: 'flex',
    alignItems: 'start',
    gap: '12px',
    marginBottom: '16px',
  },
  promptIcon: {
    fontSize: '32px',
  },
  promptInfo: {
    flex: 1,
    minWidth: 0,
  },
  promptActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  metaInfo: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    marginTop: '12px',
  },
  emptyState: {
    textAlign: 'center',
    ...shorthands.padding('48px', '24px'),
    ...glass.card,
    ...shorthands.borderRadius('8px'),
  },
  emptyStateDark: {
    ...glass.cardDark,
  },
});

export default function PendingPromptsSection({ isDark, onUpdate }) {
  const styles = useStyles();
  const toasterId = useId('pending-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [pendingPrompts, setPendingPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showViewDialog, setShowViewDialog] = useState(false);

  // Load pending prompts
  React.useEffect(() => {
    loadPendingPrompts();
  }, []);

  const loadPendingPrompts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/prompts?status=pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load pending prompts');

      const data = await response.json();
      setPendingPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error loading pending prompts:', error);
      dispatchToast(
        <Toast>
          <div>❌ Failed to load pending prompts</div>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleApprove = async (prompt) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://localhost:3001/api/admin/prompts/${prompt.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to approve prompt');

      const data = await response.json();

      // Remove from pending list
      setPendingPrompts(prev => prev.filter(p => p.id !== prompt.id));

      dispatchToast(
        <Toast>
          <div>✅ Prompt approved: {prompt.title}</div>
        </Toast>,
        { intent: 'success' }
      );

      // Call parent update callback
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error approving prompt:', error);
      dispatchToast(
        <Toast>
          <div>❌ Failed to approve prompt</div>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPrompt) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://localhost:3001/api/admin/prompts/${selectedPrompt.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!response.ok) throw new Error('Failed to reject prompt');

      // Remove from pending list
      setPendingPrompts(prev => prev.filter(p => p.id !== selectedPrompt.id));

      dispatchToast(
        <Toast>
          <div>❌ Prompt rejected: {selectedPrompt.title}</div>
        </Toast>,
        { intent: 'warning' }
      );

      setShowRejectDialog(false);
      setSelectedPrompt(null);
      setRejectReason('');

      // Call parent update callback
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error rejecting prompt:', error);
      dispatchToast(
        <Toast>
          <div>❌ Failed to reject prompt</div>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const openRejectDialog = (prompt) => {
    setSelectedPrompt(prompt);
    setShowRejectDialog(true);
    setRejectReason('');
  };

  const openViewDialog = (prompt) => {
    setSelectedPrompt(prompt);
    setShowViewDialog(true);
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title2>Pending Approvals</Title2>
          <Badge appearance="filled" color="warning" className={styles.badge}>
            {pendingPrompts.length} waiting
          </Badge>
        </div>
      </div>

      {pendingPrompts.length === 0 ? (
        <div className={mergeClasses(styles.emptyState, isDark && styles.emptyStateDark)}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <Title3 block style={{ marginBottom: '8px' }}>No pending submissions</Title3>
          <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
            All user submissions have been reviewed
          </Body1>
        </div>
      ) : (
        <div className={styles.gridContainer}>
          {pendingPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className={mergeClasses(styles.promptCard, isDark && styles.promptCardDark)}
            >
              <div className={styles.promptHeader}>
                <span className={styles.promptIcon}>{prompt.icon}</span>
                <div className={styles.promptInfo}>
                  <Title3 block style={{ marginBottom: '4px' }}>
                    {prompt.title}
                  </Title3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Badge appearance="filled" color="brand">
                      {prompt.department}
                    </Badge>
                    <Badge appearance="filled" className={styles.pendingBadge}>
                      Pending Review
                    </Badge>
                  </div>
                </div>
              </div>

              <Body2 block style={{ marginBottom: '8px', color: tokens.colorNeutralForeground2 }}>
                {prompt.description && prompt.description.length > 120
                  ? `${prompt.description.substring(0, 120)}...`
                  : prompt.description
                }
              </Body2>

              <div className={styles.metaInfo}>
                <span>
                  <Calendar24Regular style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {new Date(prompt.submitted_date || prompt.date).toLocaleDateString()}
                </span>
                <span>{prompt.word_count} words</span>
                {prompt.tags && prompt.tags.length > 0 && (
                  <span>{prompt.tags.length} tags</span>
                )}
              </div>

              <div className={styles.promptActions}>
                <Button
                  appearance="subtle"
                  icon={<Eye24Regular />}
                  onClick={() => openViewDialog(prompt)}
                  size="small"
                >
                  View
                </Button>
                <div style={{ flex: 1 }} />
                <Button
                  appearance="secondary"
                  icon={<Dismiss24Regular />}
                  onClick={() => openRejectDialog(prompt)}
                  disabled={loading}
                  size="small"
                >
                  Reject
                </Button>
                <Button
                  appearance="primary"
                  icon={<Checkmark24Regular />}
                  onClick={() => handleApprove(prompt)}
                  disabled={loading}
                  size="small"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  }}
                >
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={(e, data) => !data.open && setShowRejectDialog(false)}>
        <DialogSurface style={{ maxWidth: '500px' }}>
          <DialogBody>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogContent>
              <Body1 block style={{ marginBottom: '16px' }}>
                Are you sure you want to reject this prompt?
              </Body1>
              <Body2 block style={{ fontWeight: 600, marginBottom: '12px' }}>
                {selectedPrompt?.title}
              </Body2>
              <Textarea
                placeholder="Optional: Provide a reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                style={{ width: '100%' }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? 'Rejecting...' : 'Reject'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={(e, data) => !data.open && setShowViewDialog(false)}>
        <DialogSurface style={{ maxWidth: '700px', maxHeight: '80vh', overflow: 'auto' }}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  onClick={() => setShowViewDialog(false)}
                />
              }
            >
              Preview Submission
            </DialogTitle>
            <DialogContent>
              {selectedPrompt && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '48px' }}>{selectedPrompt.icon}</span>
                    <div>
                      <Title3 block>{selectedPrompt.title}</Title3>
                      <Badge appearance="filled" color="brand">{selectedPrompt.department}</Badge>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <Body1 block style={{ fontWeight: 600, marginBottom: '8px' }}>Description:</Body1>
                    <Body2 block>{selectedPrompt.description}</Body2>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <Body1 block style={{ fontWeight: 600, marginBottom: '8px' }}>Full Prompt:</Body1>
                    <div style={{
                      background: isDark ? tokens.colorNeutralBackground3 : tokens.colorNeutralBackground2,
                      ...shorthands.padding('16px'),
                      ...shorthands.borderRadius('6px'),
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '400px',
                      overflow: 'auto'
                    }}>
                      {selectedPrompt.content}
                    </div>
                  </div>

                  {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
                    <div>
                      <Body1 block style={{ fontWeight: 600, marginBottom: '8px' }}>Tags:</Body1>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {selectedPrompt.tags.map((tag, idx) => (
                          <Badge key={idx} appearance="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                icon={<Dismiss24Regular />}
                onClick={() => {
                  openRejectDialog(selectedPrompt);
                  setShowViewDialog(false);
                }}
              >
                Reject
              </Button>
              <Button
                appearance="primary"
                icon={<Checkmark24Regular />}
                onClick={() => {
                  handleApprove(selectedPrompt);
                  setShowViewDialog(false);
                }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                Approve
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
