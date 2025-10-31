import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config';
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
  Add24Regular,
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

export default function AddPromptModal({ isOpen, onClose, onSubmit }) {
  const styles = useStyles();
  const toasterId = useId('add-prompt-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    subcategory: '',
    description: '',
    content: '',
    tags: '',
    icon: '⚡',
    complexity: '',
    tips: '',
    whatItDoes: '',
    howToUse: '',
    exampleInput: '',
    images: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        department: '',
        subcategory: '',
        description: '',
        content: '',
        tags: '',
        icon: '⚡',
        complexity: '',
        tips: '',
        whatItDoes: '',
        howToUse: '',
        exampleInput: '',
        images: '',
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Update icon when department changes
  useEffect(() => {
    if (formData.department) {
      const dept = DEPARTMENTS.find(d => d.name === formData.department);
      if (dept) {
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
      // Prepare data for API
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const tipsArray = formData.tips
        .split('\n')
        .map(tip => tip.trim())
        .filter(tip => tip.length > 0);

      const imagesArray = formData.images
        .split(',')
        .map(img => img.trim())
        .filter(img => img.length > 0);

      // Send to API server
      const response = await fetch(`${API_ENDPOINTS.API_URL}/api/admin/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department: formData.department,
          title: formData.title.trim(),
          description: formData.description.trim(),
          content: formData.content.trim(),
          tags: tagsArray,
          subcategory: formData.subcategory.trim(),
          complexity: formData.complexity || 'intermediate',
          tips: tipsArray,
          images: imagesArray,
          icon: formData.icon,
          metadata: {
            additional_tips: [],
            what_it_does: formData.whatItDoes.trim() || '',
            how_to_use: formData.howToUse.trim() || '',
            example_input: formData.exampleInput.trim() || '',
            example_output: '',
            date: new Date().toISOString().split('T')[0],
          },
          created_by: 'anonymous', // TODO: Replace with actual user ID when auth is added
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save prompt');
      }

      const result = await response.json();

      // Call the onSubmit callback with the saved prompt from API
      if (result.success && result.prompt) {
        await onSubmit(result.prompt);
      }

      dispatchToast(
        <Toast>
          <div>✅ Prompt added successfully!</div>
        </Toast>,
        { intent: 'success' }
      );

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error adding prompt:', error);
      dispatchToast(
        <Toast>
          <div>❌ Failed to add prompt: {error.message}</div>
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
              <Add24Regular />
              <span>Add New Prompt</span>
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
                hint="Comma-separated tags (e.g., analysis, strategy, planning)"
              >
                <Input
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="analysis, strategy, planning"
                  disabled={isSubmitting}
                />
              </Field>

              {/* Complexity */}
              <Field
                label="Complexity Level"
                hint="Select the difficulty level"
              >
                <Dropdown
                  placeholder="Select complexity"
                  value={formData.complexity}
                  onOptionSelect={(e, data) => handleChange('complexity', data.optionValue || '')}
                  disabled={isSubmitting}
                >
                  <Option value="beginner">🟢 Beginner</Option>
                  <Option value="intermediate">🟡 Intermediate</Option>
                  <Option value="advanced">🔴 Advanced</Option>
                </Dropdown>
              </Field>

              {/* Tips */}
              <Field
                label="Tips"
                className={styles.fullWidth}
                hint="One tip per line - helpful usage suggestions for this prompt"
              >
                <Textarea
                  value={formData.tips}
                  onChange={(e) => handleChange('tips', e.target.value)}
                  placeholder="Prioritize the classification of expenses into fixed and variable costs...&#10;Utilize industry-specific benchmarks for comparative analysis...&#10;Develop a continuous improvement plan..."
                  className={styles.tagsInput}
                  disabled={isSubmitting}
                />
              </Field>

              {/* What It Does */}
              <Field
                label="What This Prompt Does"
                className={styles.fullWidth}
                hint="Bullet points explaining the capabilities (use • or ● for bullets)"
              >
                <Textarea
                  value={formData.whatItDoes}
                  onChange={(e) => handleChange('whatItDoes', e.target.value)}
                  placeholder="● Conducts a detailed financial analysis...&#10;● Compares costs against industry benchmarks...&#10;● Provides actionable recommendations..."
                  className={styles.tagsInput}
                  disabled={isSubmitting}
                />
              </Field>

              {/* How To Use */}
              <Field
                label="How To Use This Prompt"
                className={styles.fullWidth}
                hint="Step-by-step instructions (use • or ● for bullet points)"
              >
                <Textarea
                  value={formData.howToUse}
                  onChange={(e) => handleChange('howToUse', e.target.value)}
                  placeholder="● Fill in the placeholders [DESCRIBE YOUR BUSINESS]...&#10;● Example: If your business is a small bakery..."
                  className={styles.tagsInput}
                  disabled={isSubmitting}
                />
              </Field>

              {/* Example Input */}
              <Field
                label="Example Input"
                className={styles.fullWidth}
                hint="A filled-in example showing real-world usage (use • or ● for bullets)"
              >
                <Textarea
                  value={formData.exampleInput}
                  onChange={(e) => handleChange('exampleInput', e.target.value)}
                  placeholder="#INFORMATION ABOUT ME:&#10;● My business: Spark, the biggest collection of easy-to-follow AI resources...&#10;● Industry sector: Digital Marketing and AI Resources..."
                  className={styles.tagsInput}
                  disabled={isSubmitting}
                />
              </Field>

              {/* Images */}
              <Field
                label="Example Output Images"
                className={styles.fullWidth}
                hint="Comma-separated image filenames (e.g., example1.png, example2.png)"
              >
                <Input
                  value={formData.images}
                  onChange={(e) => handleChange('images', e.target.value)}
                  placeholder="example1.png, example2.png"
                  disabled={isSubmitting}
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
              {isSubmitting ? 'Adding...' : 'Add Prompt'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
