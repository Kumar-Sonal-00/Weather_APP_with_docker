using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations.Schema;

namespace Registration_Service.Models
{
    public class User
    {
        [BsonId]
        public ObjectId Id { get; set; }

        public string fullName { get; set; }
        public string email { get; set; }
        public string password { get; set; }

        [NotMapped]
        public string confirmPassword { get; set; }
    }
}