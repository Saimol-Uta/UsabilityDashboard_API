# Guía de Implementación - Login Component

## Componente: Login.tsx

### Requisitos
- ✅ Validación en tiempo real
- ✅ Mensajes de error específicos
- ✅ Feedback visual de carga
- ✅ Recuperación de contraseña
- ✅ Accesibilidad WCAG AA

### Estructura

```typescript
// Login.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const loginSchema = yup.object().shape({
  email: yup.string()
    .email('Email inválido')
    .required('Email es requerido'),
  password: yup.string()
    .min(8, 'Mínimo 8 caracteres')
    .required('Contraseña es requerida')
});

export function LoginComponent() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = 
    useForm({ resolver: yupResolver(loginSchema), mode: 'onChange' });

  const [generalError, setGeneralError] = useState('');

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('token', result.token);
        window.location.href = '/dashboard';
      } else {
        if (response.status === 401) {
          setGeneralError('Credenciales incorrectas');
        } else if (response.status === 429) {
          setGeneralError('Cuenta bloqueada por intentos fallidos');
        }
      }
    } catch (error) {
      setGeneralError('Error de conexión');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Email Field */}
      <div className="form-group">
        <label htmlFor="email">Email Corporativo *</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'is-invalid' : 'is-valid'}
        />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      {/* Password Field */}
      <div className="form-group">
        <label htmlFor="password">Contraseña *</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className={errors.password ? 'is-invalid' : 'is-valid'}
        />
        {errors.password && <span className="error">{errors.password.message}</span>}
        <a href="/forgot-password">¿Olvidó su contraseña?</a>
      </div>

      {generalError && <div className="alert alert-danger">{generalError}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
```

### Validador Backend (C#)

```csharp
// LoginValidator.cs
using FluentValidation;

public class LoginValidator : AbstractValidator<LoginRequest>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email es requerido")
            .EmailAddress().WithMessage("Email inválido");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Contraseña es requerida")
            .MinimumLength(8).WithMessage("Mínimo 8 caracteres");
    }
}
```

### CSS

```css
.form-control {
  border: 2px solid #ddd;
  transition: border-color 0.3s;
}

.form-control.is-valid {
  border-color: #28a745;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}
```

### Testing

- [ ] Email válido + Password válido → Login exitoso
- [ ] Email inválido → Mostrar "Email inválido"
- [ ] Email no registrado → Mostrar "Email no está registrado"
- [ ] Password corta → Mostrar "Mínimo 8 caracteres"
- [ ] Password incorrecta → Mostrar "Contraseña incorrecta"
- [ ] Click "Olvidé contraseña" → Navegar a form de recuperación
- [ ] Button deshabilitado durante carga
- [ ] Accesible con teclado (Tab, Enter)

**Hallazgos resueltos:** H01, H02, H03
