import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  getAllProfiles,
  updateProfileStatus,
} from '../firebase/firebaseService';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Users, Clock, Shield, Download, Search, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, married: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [profiles, filterStatus, filterGender, searchTerm]);

  const loadProfiles = async () => {
    try {
      const data = await getAllProfiles();
      setProfiles(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(p => p.status === 'pending').length,
      approved: data.filter(p => p.status === 'approved').length,
      rejected: data.filter(p => p.status === 'rejected').length,
      married: data.filter(p => p.status === 'married').length
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...profiles];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        (p.fullName && p.fullName.toLowerCase().includes(search)) ||
        (p.email && p.email.toLowerCase().includes(search)) ||
        (p.mobile && p.mobile.includes(search)) ||
        (p.location && p.location.toLowerCase().includes(search))
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Gender filter
    if (filterGender) {
      filtered = filtered.filter(p => p.gender === filterGender);
    }

    setFilteredProfiles(filtered);
  };

  const handleStatusChange = async (uid, newStatus) => {
    try {
      await updateProfileStatus(uid, newStatus);
      toast.success(`Profile status updated to ${newStatus}`);
      loadProfiles();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleProfileClick = (profile) => {
    // Navigate to profile page with userId query param
    // Use uid if available, otherwise use id
    const userId = profile.uid || profile.id;
    console.log('Navigating to profile:', userId);
    navigate(`/profile?userId=${userId}`);
  };

  const downloadCSV = () => {
    // Prepare CSV data
    const headers = [
      'Name', 'Email', 'Mobile', 'Age', 'Gender', 'Location', 
      'Detail Location', 'Hobbies', 'Must Have', 'Bihar/Bahi', 
      'Caste', 'Intercaste', 'Status', 'Created At'
    ];

    const rows = filteredProfiles.map(p => [
      p.fullName || '',
      p.email || '',
      p.mobile || '',
      p.age || '',
      p.gender || '',
      p.location || '',
      p.detailLocation || '',
      Array.isArray(p.hobbies) ? p.hobbies.join('; ') : (p.hobbies || ''),
      p.mustHave || '',
      p.biharBahi || '',
      p.caste || '',
      p.intercaste || '',
      p.status || '',
      p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : ''
    ]);

    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      const escapedRow = row.map(cell => {
        // Escape cells that contain commas or quotes
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      });
      csvContent += escapedRow.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shubhmangal_profiles_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloaded ${filteredProfiles.length} profiles`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-12 px-6">
      <div className="container mx-auto max-w-7xl" data-testid="admin-dashboard">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-rose-600" />
            <h2 
              className="text-4xl font-bold"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Admin Dashboard
            </h2>
          </div>
          <Button
            onClick={downloadCSV}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-8" data-testid="admin-stats">
          {[
            { label: 'Total Profiles', value: stats.total, icon: Users, color: 'from-blue-400 to-blue-500' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-400 to-yellow-500' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'from-green-400 to-green-500' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-400 to-red-500' },
            { label: 'Married', value: stats.married, icon: Heart, color: 'from-pink-400 to-pink-500' }
          ].map((stat, idx) => (
            <Card key={idx} className="p-6 border-0 bg-white/80 backdrop-blur" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 uppercase font-semibold">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 border-0 bg-white/80 backdrop-blur">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, mobile, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Label>Status Filter</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="filter-status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender Filter */}
            <div>
              <Label>Gender Filter</Label>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger data-testid="filter-gender">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Profile Cards */}
        <div className="space-y-4">
          {filteredProfiles.map((profile) => (
            <Card 
              key={profile.id} 
              className="p-6 border-0 bg-white/80 backdrop-blur hover:shadow-lg transition-shadow cursor-pointer" 
              data-testid="profile-card"
              onClick={() => handleProfileClick(profile)}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image */}
                <img
                  src={profile.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt={profile.fullName}
                  className="w-24 h-24 rounded-xl object-cover border-2 border-rose-100"
                />

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold" data-testid="profile-name">{profile.fullName || 'No Name'}</h3>
                      <p className="text-gray-600 text-sm">{profile.email}</p>
                      {profile.mobile && (
                        <p className="text-gray-600 text-sm">📱 {profile.mobile}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      profile.status === 'approved' ? 'bg-green-100 text-green-700' :
                      profile.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      profile.status === 'married' ? 'bg-pink-100 text-pink-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`} data-testid="profile-status">
                      {profile.status || 'pending'}
                    </span>
                  </div>

                  {/* Profile Details */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-sm">
                    <div><span className="text-gray-500">Age:</span> <strong>{profile.age || 'N/A'}</strong></div>
                    <div><span className="text-gray-500">Gender:</span> <strong>{profile.gender || 'N/A'}</strong></div>
                    <div><span className="text-gray-500">Location:</span> <strong>{profile.location || 'N/A'}</strong></div>
                    <div><span className="text-gray-500">Contact:</span> <strong>{profile.mobile || 'N/A'}</strong></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                    {profile.status !== 'approved' && (
                      <Button
                        data-testid="approve-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(profile.id, 'approved');
                        }}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {profile.status !== 'rejected' && (
                      <Button
                        data-testid="reject-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(profile.id, 'rejected');
                        }}
                        size="sm"
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    )}
                    {profile.status !== 'married' && profile.status === 'approved' && (
                      <Button
                        data-testid="married-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(profile.id, 'married');
                        }}
                        size="sm"
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        Married
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredProfiles.length === 0 && (
            <Card className="p-12 text-center border-0 bg-white/80 backdrop-blur">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg">No profiles found</p>
              {(searchTerm || filterStatus || filterGender) && (
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;