import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { mockStaff } from "../data/mockData";
import { 
  Plus, 
  User, 
  Phone, 
  CreditCard, 
  UserX, 
  UserCheck,
  Pause,
  Play,
  X,
  Save
} from "lucide-react";

interface NewStaffForm {
  firstName: string;
  lastName: string;
  cin: string;
  phoneNumber: string;
}

export default function StaffManagement() {
  const [staffList, setStaffList] = useState(mockStaff.filter(s => s.role === 'WORKER'));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState<NewStaffForm>({
    firstName: '',
    lastName: '',
    cin: '',
    phoneNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add new staff member
    const newStaffMember = {
      id: `staff-${Date.now()}`,
      cin: newStaff.cin,
      firstName: newStaff.firstName,
      lastName: newStaff.lastName,
      role: 'WORKER' as const,
      phoneNumber: newStaff.phoneNumber,
      isActive: true
    };

    setStaffList(prev => [...prev, newStaffMember]);

    // Reset form
    setNewStaff({
      firstName: '',
      lastName: '',
      cin: '',
      phoneNumber: ''
    });
    setShowAddModal(false);
    setIsSubmitting(false);
  };

  const handleToggleStatus = (staffId: string) => {
    setStaffList(prev => 
      prev.map(staff => 
        staff.id === staffId 
          ? { ...staff, isActive: !staff.isActive }
          : staff
      )
    );
  };

  const handleRemoveStaff = (staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member? This action cannot be undone.')) {
      setStaffList(prev => prev.filter(staff => staff.id !== staffId));
    }
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\+216)\s*(\d{2})\s*(\d{3})\s*(\d{3})/, '$1 $2 $3 $4');
  };

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage station workers and their access</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Worker</span>
        </Button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.map((staff) => (
          <Card key={staff.id} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  staff.isActive ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{staff.firstName} {staff.lastName}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    staff.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{staff.cin}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formatPhone(staff.phoneNumber)}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(staff.id)}
                className="flex-1"
              >
                {staff.isActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Freeze
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Activate
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveStaff(staff.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <UserX className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add New Worker</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    type="text"
                    required
                    value={newStaff.firstName}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Ahmed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newStaff.lastName}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Ben Ali"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">CIN Number</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={newStaff.cin}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, cin: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono"
                  placeholder="12345678"
                />
                <p className="text-xs text-muted-foreground">8-digit national ID number</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newStaff.phoneNumber}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="+216 20 123 456"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Add Worker
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {staffList.length === 0 && (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Workers Found</h3>
          <p className="text-muted-foreground mb-4">
            Add your first worker to get started with staff management.
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Worker
          </Button>
        </Card>
      )}
    </div>
  );
} 