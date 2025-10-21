import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Input,
  Badge,
  Card,
  Text,
  Title3,
  Subtitle2,
  Body1,
  Field,
  Toast,
  Toaster,
  useToastController,
  useId,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Checkmark24Filled,
  Copy24Regular,
  Search24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  floatingButton: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    background: 'linear-gradient(135deg, #6264A7 0%, #8b5cf6 100%)',
    color: 'white',
    ...shorthands.borderRadius('50px'),
    ...shorthands.padding('16px', '32px'),
    fontSize: '18px',
    fontWeight: 700,
    boxShadow: '0 8px 24px rgba(98, 100, 167, 0.4)',
    cursor: 'move',
    userSelect: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 32px rgba(98, 100, 167, 0.6)',
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
  },
  drawerContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...shorthands.gap('16px'),
  },
  searchBox: {
    width: '100%',
  },
  promptCard: {
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  promptsList: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
    overflowY: 'auto',
    flex: 1,
  },
  detailView: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('24px'),
    height: '100%',
    overflowY: 'auto',
  },
  variableField: {
    marginBottom: '16px',
  },
  actionButtons: {
    display: 'flex',
    ...shorthands.gap('12px'),
    marginTop: '24px',
  },
  badge: {
    marginRight: '8px',
  },
});

const CopilotIntegration = () => {
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [customValues, setCustomValues] = useState({});
  const [position, setPosition] = useState({ x: window.innerWidth - 200, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const toasterId = useId('copilot-toaster');
  const { dispatchToast } = useToastController(toasterId);

  // Load prompts from API
  useEffect(() => {
    fetch('/api/prompts')
      .then(res => res.json())
      .then(data => {
        const allPrompts = data.prompts || [];
        setPrompts(allPrompts);
        setFilteredPrompts(allPrompts);
      })
      .catch(err => console.error('Failed to load prompts:', err));
  }, []);

  // Filter prompts based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPrompts(prompts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = prompts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.department?.toLowerCase().includes(query) ||
      p.content?.toLowerCase().includes(query)
    );
    setFilteredPrompts(filtered);
  }, [searchQuery, prompts]);

  // Detect variables in prompt content
  const detectVariables = (content) => {
    if (!content) return [];
    const matches = [];
    const patterns = [
      /\[INSERT\s+([^\]]+)\]/g,
      /\[(?!INSERT\s)([^\]]+)\]/g,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        matches.push({
          full: match[0],
          name: match[1],
          placeholder: `Enter ${match[1].toLowerCase()}`,
        });
      }
    });

    // Remove duplicates
    const unique = [];
    const seen = new Set();
    matches.forEach(m => {
      if (!seen.has(m.full)) {
        seen.add(m.full);
        unique.push(m);
      }
    });

    return unique;
  };

  // Handle prompt selection
  const handleSelectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setCustomValues({});
  };

  // Handle variable input change
  const handleVariableChange = (variableFull, value) => {
    setCustomValues(prev => ({
      ...prev,
      [variableFull]: value,
    }));
  };

  // Replace variables in content
  const getCustomizedContent = () => {
    if (!selectedPrompt) return '';

    let content = selectedPrompt.content;
    Object.entries(customValues).forEach(([variableFull, value]) => {
      if (value.trim()) {
        content = content.split(variableFull).join(value);
      }
    });

    return content;
  };

  // Copy to Copilot (cross-tab integration)
  const handleCopyToCopilot = async () => {
    const customizedContent = getCustomizedContent();

    // Try to find M365 Copilot tab and insert
    try {
      // First, copy to clipboard as fallback
      await navigator.clipboard.writeText(customizedContent);

      // Try to detect and send to M365 Copilot tab
      if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('spark-copilot');
        channel.postMessage({
          action: 'INSERT_PROMPT',
          content: customizedContent,
        });

        dispatchToast(
          <Toast>
            <Checkmark24Filled style={{ color: tokens.colorPaletteGreenForeground1 }} />
            <Body1>Prompt sent to M365 Copilot! Also copied to clipboard.</Body1>
          </Toast>,
          { intent: 'success' }
        );
      } else {
        dispatchToast(
          <Toast>
            <Copy24Regular />
            <Body1>Prompt copied to clipboard! Paste it in M365 Copilot.</Body1>
          </Toast>,
          { intent: 'info' }
        );
      }
    } catch (err) {
      dispatchToast(
        <Toast>
          <Body1>Error: {err.message}</Body1>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  // Dragging functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setHasMoved(false);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setHasMoved(true);
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const variables = selectedPrompt ? detectVariables(selectedPrompt.content) : [];

  return (
    <>
      <Toaster toasterId={toasterId} position="top-end" />

      {/* Floating Movable Button */}
      <div
        className={styles.floatingButton}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          if (!hasMoved) {
            setIsOpen(true);
          }
        }}
      >
        ⚡ {prompts.length.toLocaleString()}+ Prompts
      </div>

      {/* Sidecar Drawer */}
      <Drawer
        open={isOpen}
        onOpenChange={(_, { open }) => setIsOpen(open)}
        position="end"
        size="large"
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={() => {
                  setIsOpen(false);
                  setSelectedPrompt(null);
                }}
              />
            }
          >
            {selectedPrompt ? selectedPrompt.title : 'SPARK Prompt Library'}
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody>
          <div className={styles.drawerContent}>
            {!selectedPrompt ? (
              /* Prompt List View */
              <>
                <Input
                  className={styles.searchBox}
                  placeholder="Search 2,425+ prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  contentBefore={<Search24Regular />}
                />

                <div style={{ marginBottom: '8px' }}>
                  <Text weight="semibold">
                    {filteredPrompts.length.toLocaleString()} prompts found
                  </Text>
                </div>

                <div className={styles.promptsList}>
                  {filteredPrompts.map((prompt) => {
                    const vars = detectVariables(prompt.content);
                    return (
                      <Card
                        key={prompt.id}
                        className={styles.promptCard}
                        onClick={() => handleSelectPrompt(prompt)}
                      >
                        <div style={{ padding: '12px' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <Text weight="semibold" size={400}>
                              {prompt.title}
                            </Text>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Badge appearance="outline" className={styles.badge}>
                              {prompt.department || 'General'}
                            </Badge>
                            {vars.length > 0 && (
                              <Badge appearance="tint" color="brand">
                                {vars.length} variable{vars.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Prompt Detail View with Customization */
              <div className={styles.detailView}>
                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  onClick={() => setSelectedPrompt(null)}
                >
                  Back to Library
                </Button>

                <div>
                  <Title3>{selectedPrompt.title}</Title3>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <Badge appearance="filled" color="brand">
                      {selectedPrompt.department || 'General'}
                    </Badge>
                    {variables.length > 0 && (
                      <Badge appearance="tint">
                        {variables.length} customizable field{variables.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>

                {selectedPrompt.description && (
                  <div>
                    <Subtitle2>Description</Subtitle2>
                    <Body1>{selectedPrompt.description}</Body1>
                  </div>
                )}

                {variables.length > 0 && (
                  <div>
                    <Subtitle2 style={{ marginBottom: '16px' }}>
                      Customize Your Prompt
                    </Subtitle2>
                    {variables.map((variable, index) => (
                      <Field
                        key={index}
                        label={variable.name}
                        className={styles.variableField}
                      >
                        <Input
                          placeholder={variable.placeholder}
                          value={customValues[variable.full] || ''}
                          onChange={(e) => handleVariableChange(variable.full, e.target.value)}
                        />
                      </Field>
                    ))}
                  </div>
                )}

                <div>
                  <Subtitle2>Preview</Subtitle2>
                  <Card style={{ marginTop: '12px', padding: '16px', background: tokens.colorNeutralBackground3 }}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', margin: 0 }}>
                      {getCustomizedContent()}
                    </pre>
                  </Card>
                </div>

                <div className={styles.actionButtons}>
                  <Button
                    appearance="primary"
                    size="large"
                    onClick={handleCopyToCopilot}
                    icon={<Copy24Regular />}
                  >
                    Copy to M365 Copilot
                  </Button>
                  <Button
                    appearance="outline"
                    size="large"
                    onClick={() => setSelectedPrompt(null)}
                  >
                    Cancel
                  </Button>
                </div>

                {selectedPrompt.tips && (
                  <div>
                    <Subtitle2>Tips</Subtitle2>
                    <ul style={{ paddingLeft: '20px' }}>
                      {selectedPrompt.tips.split('\n').map((tip, i) => (
                        <li key={i}>
                          <Body1>{tip}</Body1>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </DrawerBody>
      </Drawer>
    </>
  );
};

export default CopilotIntegration;
