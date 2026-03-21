using Application.DTOs;
using AutoMapper;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // TestPlan
            CreateMap<TestPlan, TestPlanDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));
            CreateMap<CreateTestPlanDto, TestPlan>();  
            CreateMap<UpdateTestPlanDto, TestPlan>()
                .ForMember(dest => dest.Status, opt => opt.Ignore());

            // TestTask
            CreateMap<TestTask, TestTaskDto>();
            CreateMap<CreateTestTaskDto, TestTask>();
            CreateMap<UpdateTestTaskDto, TestTask>();

            // Participant
            CreateMap<Participant, ParticipantDto>();
            CreateMap<CreateParticipantDto, Participant>();
            CreateMap<UpdateParticipantDto, Participant>();

            // Finding
            CreateMap<Finding, FindingDto>()
                .ForMember(dest => dest.Severity, opt => opt.MapFrom(src => src.Severity.ToString()))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
            CreateMap<CreateFindingDto, Finding>();
            CreateMap<UpdateFindingDto, Finding>();

            // ObservationLog
            CreateMap<ObservationLog, ObservationLogDto>()
                .ForMember(dest => dest.Severity, opt => opt.MapFrom(src => src.Severity.ToString()));
            CreateMap<CreateObservationLogDto, ObservationLog>();
            CreateMap<UpdateObservationLogDto, ObservationLog>();

            // ImprovementAction
            CreateMap<ImprovementAction, ImprovementActionDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority.ToString()));
            CreateMap<CreateImprovementActionDto, ImprovementAction>();
            CreateMap<UpdateImprovementActionDto, ImprovementAction>();

            // ModeratorScript
            CreateMap<ModeratorScript, ModeratorScriptDto>();
            CreateMap<CreateModeratorScriptDto, ModeratorScript>();
            CreateMap<UpdateModeratorScriptDto, ModeratorScript>();

            // TestSession
            CreateMap<TestSession, TestSessionDto>()
                .ForMember(dest => dest.ParticipantName,
                    opt => opt.MapFrom(src => src.Participant != null ? src.Participant.Name : string.Empty));
            CreateMap<CreateTestSessionDto, TestSession>();
            CreateMap<UpdateTestSessionDto, TestSession>();

        }
    }
}
