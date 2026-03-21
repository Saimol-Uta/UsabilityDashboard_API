using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record ParticipantDto(
    Guid Id,
    string Name,
    int Age,
    string Profile
);

    public record CreateParticipantDto(
        string Name,
        int Age,
        string Profile
    );

    public record UpdateParticipantDto(
        string Name,
        int Age,
        string Profile
    );
}
