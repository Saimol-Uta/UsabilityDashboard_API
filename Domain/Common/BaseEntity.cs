
namespace Domain.Common
{
    public abstract class BaseEntity
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        // el DateTime.UtcNow se utiliza para establecer la fecha y hora actual 
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;

    }
}
