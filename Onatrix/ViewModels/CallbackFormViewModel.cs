using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding;


namespace Onatrix.ViewModels;

public class CallbackFormViewModel
{
    [Required(ErrorMessage = "Name is required")]
    [Display(Name = "Name")]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "Email is required")]
    [Display(Name = "Email address")]
    [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", 
        ErrorMessage = "Invalid email address format")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Phone is required")]
    [Display(Name = "Phone number")]
    [RegularExpression(@"^(\+46[1-9]\d{8}|0[1-9]\d{8})$", ErrorMessage = "Invalid phone number")]
    public string Phone { get; set; } = null!;

    [Required(ErrorMessage = "Please select an option")]
    public string SelectedOption { get; set; } = null!;

    [BindNever]
    public IEnumerable<string> Options { get; set; } = [];
}