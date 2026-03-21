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
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
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
        }
    }
}
