using System;

namespace Registration_Service.Exceptions
{
  public class ArgumentNullException : Exception
  {
    // Constructor that takes a message parameter
    public ArgumentNullException(string message)
        : base(message)
    {
    }

    // Constructor that takes a message and an inner exception
    public ArgumentNullException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
  }
}