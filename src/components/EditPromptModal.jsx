import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Textarea,
  Dropdown,
  Option,
  Label,
  Field,
  Toast,
  useToastController,
  useId,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Checkmark24Regular,
  Edit24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('20px'),
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    ...shorthands.gap('16px'),
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  textarea: {
    minHeight: '200px',
  },
  tagsInput: {
    minHeight: '60px',
  },
});

const DEPARTMENTS = [
  { name: 'Business', icon: '💼' },
  { name: 'Marketing', icon: '📢' },
  { name: 'Sales', icon: '💰' },
  { name: 'SEO', icon: '🔍' },
  { name: 'Finance', icon: '💵' },
  { name: 'Education', icon: '📚' },
  { name: 'Writing', icon: '✍️' },
  { name: 'Productivity', icon: '⚡' },
  { name: 'Solopreneurs', icon: '🚀' },
];

export default function EditPromptModal({ isOpen, onClose, prompt, onUpdate }) {
  const styles = useStyles();
  const toasterId = useId('edit-prompt-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    subcategory: '',
    description: '',
    content: '',
    tags: '',
    icon: '⚡',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load prompt data when modal opens
  useEffect(() => {
    if (isOpen && prompt) {
      setFormData({
        title: prompt.title || '',
        department: prompt.department || '',
        subcategory: prompt.subcategory || '',
        description: prompt.description || '',
        content: prompt.content || '',
        tags: Array.isArray(prompt.tags) ? prompt.tags.join(', ') : prompt.tags || '',
        icon: prompt.icon || '⚡',
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, prompt]);

  // Update icon when department changes
  useEffect(() => {
    if (formData.department) {
      const dept = DEPARTMENTS.find(d => d.name === formData.department);
      if (dept && dept.icon !== formData.icon) {
        setFormData(prev => ({ ...prev, icon: dept.icon }));
      }
    }
  }, [formData.department]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.subcategory.trim()) {
      newErrors.subcategory = 'Subcategory is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Prompt content is required';
    } else if (formData.content.trim().length < 100) {
      newErrors.content = 'Prompt content must be at least 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      dispatchToast(
        <Toast>
          <div>❌ Please fix the errors before submitting</div>
        </Toast>,
        { intent: 'error' }
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');

      // Prepare tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Calculate word count
      const wordCount = formData.content.trim().split(/\s+/).filter(w => w.length > 0).length;

      // Prepare updated prompt data
      const updatedPrompt = {
        ...prompt,
        title: formData.title.trim(),
        department: formData.department,
        subcategory: formData.subcategory.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        tags: tagsArray,
        icon: formData.icon,
        word_count: wordCount,
        last_modified: new Date().toISOString(),
      };

      // Send to API server
      const response = await fetch(`http://localhost:3001/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPrompt),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prompt');
      }

      const result = await response.json();

      // Call the onUpdate callback
      if (result.success && result.prompt) {
        await onUpdate(result.prompt);
      }

      dispatchToast(
        <Toast>
          <div>✅ Prompt updated successfully!</div>
        </Toast>,
        { intent: 'success' }
      );

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error updating prompt:', error);
      dispatchToast(
        <Toast>
          <div>❌ Failed to update prompt: {error.message}</div>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(event, data) => !data.open && onClose()}>
      <DialogSurface style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={onClose}
                disabled={isSubmitting}
              />
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Edit24Regular />
              <span>Edit Prompt</span>
            </div>
          </DialogTitle>

          <DialogContent className={styles.dialogContent}>
            <div className={styles.formGrid}>
              {/* Title */}
              <Field
                label="Prompt Title"
                required
                validationMessage={errors.title}
                validationState={errors.title ? 'error' : undefined}
                className={styles.fullWidth}
              >
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Analyze Business Cost Structure"
                  disabled={isSubmitting}
                />
              </Field>

              {/* Department */}
              <Field
                label="Department"
                required
                validationMessage={errors.department}
                validationState={errors.department ? 'error' : undefined}
              >
                <Dropdown
                  placeholder="Select department"
                  value={formData.department}
                  onOptionSelect={(e, data) => handleChange('department', data.optionValue || '')}
                  disabled={isSubmitting}
                >
                  {DEPARTMENTS.map(dept => (
                    <Option key={dept.name} value={dept.name}>
                      {dept.icon} {dept.name}
                    </Option>
                  ))}
                </Dropdown>
              </Field>

              {/* Subcategory */}
              <Field
                label="Subcategory"
                required
                validationMessage={errors.subcategory}
                validationState={errors.subcategory ? 'error' : undefined}
              >
                <Input
                  value={formData.subcategory}
                  onChange={(e) => handleChange('subcategory', e.target.value)}
                  placeholder="e.g., Analytics & Research"
                  disabled={isSubmitting}
                />
              </Field>

              {/* Description */}
              <Field
                label="Description"
                required
                validationMessage={errors.description}
                validationState={errors.description ? 'error' : undefined}
                className={styles.fullWidth}
                hint="Provide a brief description of what this prompt does (minimum 50 characters)"
              >
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="💡Optimize your business's financial performance with this mega-prompt..."
                  className={styles.tagsInput}
                  disabled={isSubmitting}
                />
              </Field>

              {/* Prompt Content */}
              <Field
                label="Prompt Content"
                required
                validationMessage={errors.content}
                validationState={errors.content ? 'error' : undefined}
                className={styles.fullWidth}
                hint="The full prompt text (minimum 100 characters)"
              >
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="#CONTEXT:&#10;You are an expert...&#10;&#10;#GOAL:&#10;...&#10;&#10;#RESPONSE GUIDELINES:&#10;..."
                  className={styles.textarea}
                  disabled={isSubmitting}
                />
              </Field>

              {/* Tags */}
              <Field
                label="Tags"
                className={styles.fullWidth}
                hint="Comma-separated tags (e.g., analysis, strategy, planning)"
              >
                <Input
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="analysis, strategy, planning"
                  disabled={isSubmitting}
                />
              </Field>

              {/* Icon Display */}
              <Field
                label="Icon"
                hint="Automatically set based on department"
              >
                <Input
                  value={formData.icon}
                  disabled
                  style={{ fontSize: '24px', textAlign: 'center' }}
                />
              </Field>
            </div>

            {/* Character counts */}
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: tokens.colorNeutralForeground2 }}>
              <span>Description: {formData.description.length} characters</span>
              <span>Content: {formData.content.length} characters</span>
              <span>Words: {formData.content.trim().split(/\s+/).filter(w => w.length > 0).length}</span>
            </div>
          </DialogContent>

          <DialogActions>
            <Button
              appearance="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              icon={<Checkmark24Regular />}
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update Prompt'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
