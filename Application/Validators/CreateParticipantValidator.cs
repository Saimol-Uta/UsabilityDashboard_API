using Application.DTOs;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Validators
{
    public class CreateParticipantValidator : AbstractValidator<CreateParticipantDto>
    {
        public CreateParticipantValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("El nombre es obligatorio")
                .MaximumLength(200);

            RuleFor(x => x.Age)
                .InclusiveBetween(1, 120).WithMessage("La edad debe estar entre 1 y 120");

            RuleFor(x => x.Profile)
                .NotEmpty().WithMessage("El perfil es obligatorio")
                .MaximumLength(500);
        }
    }
}
