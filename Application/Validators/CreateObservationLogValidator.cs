using Application.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Validators
{
    public class CreateObservationLogValidator : AbstractValidator<CreateObservationLogDto>
    {
        public CreateObservationLogValidator()
        {
            RuleFor(x => x.TestSessionId)
                .NotEmpty().WithMessage("La sesión es obligatoria");

            RuleFor(x => x.TestTaskId)
                .NotEmpty().WithMessage("La tarea es obligatoria");

            RuleFor(x => x.TimeSeconds)
                .GreaterThanOrEqualTo(0).WithMessage("El tiempo no puede ser negativo");

            RuleFor(x => x.ErrorCount)
                .GreaterThanOrEqualTo(0).WithMessage("El conteo de errores no puede ser negativo");

            RuleFor(x => x.DetectedProblem)
                .NotEmpty().WithMessage("El problema detectado es obligatorio");
        }
    }
}
