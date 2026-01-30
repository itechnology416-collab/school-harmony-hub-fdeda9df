import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin, Users, GraduationCap, Save } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockClasses } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AddStudentScreen = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    address: '',
    classId: '',
    sectionId: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.classId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    
    toast.success('Student added successfully!');
    navigate('/students');
  };

  const selectedClass = mockClasses.find(c => c.id === formData.classId);

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Add Student"
        subtitle="Register a new student"
        showBack
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john.doe@school.edu"
                className="pl-12"
              />
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 234-567-8900"
                className="pl-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex gap-2">
                {['male', 'female'].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => handleChange('gender', gender)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize",
                      formData.gender === gender 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-background border-input"
                    )}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main Street, City"
                className="pl-12"
              />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Academic Information
          </h3>
          
          <div className="space-y-2">
            <Label>Class *</Label>
            <div className="grid grid-cols-3 gap-2">
              {mockClasses.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => handleChange('classId', cls.id)}
                  className={cn(
                    "py-3 rounded-xl border text-sm font-medium transition-all",
                    formData.classId === cls.id 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-background border-input hover:border-primary/50"
                  )}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>

          {selectedClass && (
            <div className="space-y-2 mt-3">
              <Label>Section</Label>
              <div className="flex gap-2">
                {selectedClass.sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleChange('sectionId', section.id)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all",
                      formData.sectionId === section.id 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-background border-input hover:border-primary/50"
                    )}
                  >
                    {section.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Parent Information */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Parent/Guardian Information
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="parentName">Parent Name</Label>
            <Input
              id="parentName"
              value={formData.parentName}
              onChange={(e) => handleChange('parentName', e.target.value)}
              placeholder="Parent's full name"
            />
          </div>

          <div className="space-y-2 mt-3">
            <Label htmlFor="parentPhone">Parent Phone</Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="parentPhone"
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => handleChange('parentPhone', e.target.value)}
                placeholder="+1 234-567-8900"
                className="pl-12"
              />
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <Label htmlFor="parentEmail">Parent Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="parentEmail"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => handleChange('parentEmail', e.target.value)}
                placeholder="parent@email.com"
                className="pl-12"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Student
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AddStudentScreen;
