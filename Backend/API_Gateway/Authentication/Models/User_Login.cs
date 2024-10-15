using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Authentication.Models
{
    [BsonIgnoreExtraElements]
    public class User_Login
    { 
        public ObjectId Id { get; set; }

        [EmailAddress]
        public string email { get; set; }
        public string password { get; set; }
    }
}