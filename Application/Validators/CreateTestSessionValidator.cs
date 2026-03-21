using Application.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Validators
{
    public class CreateTestSessionValidator : AbstractValidator<CreateTestSessionDto>
    {
        public CreateTestSessionValidator()
        {
            RuleFor(x => x.TestPlanId)
                .NotEmpty().WithMessage("El plan de prueba es obligatorio");

            RuleFor(x => x.ParticipantId)
                .NotEmpty().WithMessage("El participante es obligatorio");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("La fecha es obligatoria")
                .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1))
                .WithMessage("La fecha no puede ser futura");

            RuleFor(x => x.PlatformTested)
                .NotEmpty().WithMessage("La plataforma evaluada es obligatoria")
                .MaximumLength(200);
        }
    }
}
