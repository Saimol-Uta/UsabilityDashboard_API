# Guía de Implementación - Form Component

## Componente: FormField Reutilizable

### Requisitos
- ✅ Validación en tiempo real
- ✅ Mostrar contador de caracteres
- ✅ Campos agrupados en secciones
- ✅ Draft auto-guardado

### Estructura

```typescript
// FormField.tsx
interface FormFieldProps {
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select';
  required: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
}

export function FormField({
  label, type, required, error, value, onChange,
  placeholder, hint, maxLength
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={error ? 'is-invalid' : ''}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={error ? 'is-invalid' : ''}
        />
      )}

      <div className="field-helpers">
        {hint && <small className="hint">{hint}</small>}
        {maxLength && (
          <small className="char-count">
            {value.length} / {maxLength}
          </small>
        )}
      </div>

      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
```

### Formulario Tabbed

```typescript
// CreateTestPlanForm.tsx
export function CreateTestPlanForm() {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    description: '',
    participantCount: '',
    tasks: []
  });
  const [errors, setErrors] = useState({});

  const tabs = [
    { label: 'Información Básica', fields: ['name', 'objective', 'description'] },
    { label: 'Participantes', fields: ['participantCount'] },
    { label: 'Tareas', fields: ['tasks'] }
  ];

  const handleSave = async () => {
    // Validate current tab
    const tabErrors = validateTab(activeTab);
    if (Object.keys(tabErrors).length > 0) {
      setErrors(tabErrors);
      return;
    }

    // Auto-save draft
    localStorage.setItem('testPlanDraft', JSON.stringify(formData));
    
    if (activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    } else {
      // Submit form
      await submitForm();
    }
  };

  return (
    <div className="form-container">
      {/* Progress Indicator */}
      <div className="progress">
        <span>{activeTab + 1} de {tabs.length}</span>
        <div className="progress-bar" style={{width: `${((activeTab + 1) / tabs.length) * 100}%`}}></div>
      </div>

      {/* Tabs */}
      <div className="form-tabs">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            className={`tab ${activeTab === idx ? 'active' : ''}`}
            onClick={() => setActiveTab(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="form-content">
        {activeTab === 0 && (
          <>
            <FormField
              label="Nombre del Test"
              type="text"
              required
              value={formData.name}
              onChange={(v) => setFormData({...formData, name: v})}
              error={errors.name}
              placeholder="Ej: Test de Navegación"
              maxLength={100}
            />
            <FormField
              label="Objetivo"
              type="textarea"
              required
              value={formData.objective}
              onChange={(v) => setFormData({...formData, objective: v})}
              error={errors.objective}
              maxLength={500}
            />
          </>
        )}

        {activeTab === 1 && (
          <FormField
            label="Cantidad de Participantes"
            type="text"
            required
            value={formData.participantCount}
            onChange={(v) => setFormData({...formData, participantCount: v})}
            error={errors.participantCount}
          />
        )}

        {activeTab === 2 && (
          <div>
            <h3>Tareas</h3>
            {/* Task list here */}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="form-actions">
        <button onClick={() => setActiveTab(Math.max(0, activeTab - 1))} disabled={activeTab === 0}>
          Anterior
        </button>
        <button onClick={() => localStorage.removeItem('testPlanDraft')} className="secondary">
          Cancelar
        </button>
        <button onClick={handleSave} className="primary">
          {activeTab === tabs.length - 1 ? 'Guardar' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}
```

### CSS

```css
.form-field {
  margin-bottom: 1.5rem;
}

.form-field label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.required {
  color: #dc3545;
  margin-left: 0.25rem;
}

.form-field input,
.form-field textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-field input.is-invalid,
.form-field textarea.is-invalid {
  border-color: #dc3545;
}

.field-helpers {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
}

.progress {
  margin-bottom: 2rem;
}

.progress-bar {
  background: #007bff;
  height: 4px;
  border-radius: 2px;
  transition: width 0.3s;
}

.form-tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #ddd;
  margin-bottom: 2rem;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.tab.active {
  color: #007bff;
  border-bottom: 3px solid #007bff;
  margin-bottom: -2px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}
```

### Testing

- [ ] Campos validan en tiempo real
- [ ] Contador de caracteres funciona
- [ ] Tab switching guarda draft
- [ ] Botón cancelar descarta cambios
- [ ] Form se puede recuperar desde draft
- [ ] Validación requerida funciona
- [ ] Botones navegación funcionan

**Hallazgos resueltos:** H17, H18, H19, H20
