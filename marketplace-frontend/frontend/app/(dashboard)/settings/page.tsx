'use client';

import { useState } from 'react';
import { Search, CheckCircle, Bell, Mail, Phone, Upload, Globe } from 'lucide-react';

type TabType = 'profile' | 'security' | 'notifications' | 'email';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const [notifications, setNotifications] = useState({
    soundEffects: true,
    newSupport: true,
    emailInvite: false,
  });

  const [emailPreferences, setEmailPreferences] = useState({
    receivingEmails: { news: true, inApp: true, email: true },
    ownerSupport: { news: true, inApp: true, email: true },
    events: { news: true, inApp: true, email: true },
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Martins',
    email: 'johnmart@gmail.com',
    phone: '+1 (243) 4589',
    country: 'Australia',
    timezone: 'PST - UTC-08:00',
  });

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-slate-900 ml-12 lg:ml-0">Settings</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-40 sm:w-64 transition-all"
              />
            </div>
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-all">
              <Bell size={20} className="text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
            <div className="p-6 flex items-center gap-4 border-b border-slate-100">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1">
                  <CheckCircle size={12} className="text-white" fill="currentColor" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">John Martins</h2>
                <p className="text-sm text-slate-600">johnmart@gmail.com</p>
                <p className="text-xs text-slate-500">Somewhere, united kingdom</p>
              </div>
            </div>

            <div className="flex border-b border-slate-100 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Profile settings
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Security settings
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Notification settings
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'email'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Email settings
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Personalize</h3>
                    <p className="text-xs text-slate-500 mb-6">Manage your personal info</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-slate-700 mb-2">First name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-700 mb-2">Last name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs text-slate-700 mb-2">Email address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs text-slate-700 mb-2">Phone number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100"
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <button className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                          <Upload size={16} />
                          Click to upload or drag and drop
                        </button>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG, GIF up to 10MB (800x400px)
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button className="px-4 py-2 text-sm border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                        Cancel
                      </button>
                      <button className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                        Save changes
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Address</h3>
                    <p className="text-xs text-slate-500 mb-6">Change your address</p>

                    <div className="mb-4">
                      <label className="block text-xs text-slate-700 mb-2">Country</label>
                      <div className="relative">
                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          value={profileData.country}
                          onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white appearance-none"
                        >
                          <option>Australia</option>
                          <option>United States</option>
                          <option>United Kingdom</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs text-slate-700 mb-2">Timezone</label>
                      <div className="relative">
                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          value={profileData.timezone}
                          onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white appearance-none"
                        >
                          <option>PST - UTC-08:00</option>
                          <option>EST - UTC-05:00</option>
                          <option>GMT - UTC+00:00</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button className="px-4 py-2 text-sm border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                        Cancel
                      </button>
                      <button className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                        Save changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <button className="px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-semibold hover:shadow-lg transition-all mr-3">
                      Notification settings
                    </button>
                    <button className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all">
                      Email settings
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Password</h3>
                    <p className="text-sm text-slate-600">Create a new secured password to change your password</p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Current password</label>
                        <input
                          type="password"
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">New password</label>
                        <input
                          type="password"
                          value={passwords.new}
                          onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <p className="text-xs text-slate-500 mt-1">Your new password must be at least than 8 characters.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm new password</label>
                        <input
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all">
                          Cancel
                        </button>
                        <button className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                          Update password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">General notifications</h3>
                    <p className="text-sm text-slate-600">Select how you&apos;ll like to hear and get emails</p>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-slate-700">Earnings report</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input type="radio" name="earnings-news" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                            <span className="text-sm text-slate-600">News</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name="earnings-inapp" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-sm text-slate-600">In app</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name="earnings-email" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-sm text-slate-600">Email</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-slate-200">
                        <span className="text-sm font-medium text-slate-700">Free Egyptian Land</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input type="radio" name="egyptian-news" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                            <span className="text-sm text-slate-600">News</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name="egyptian-inapp" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-sm text-slate-600">In app</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name="egyptian-email" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-sm text-slate-600">Email</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-slate-200">
                        <span className="text-sm font-medium text-slate-700">Events in squares</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input type="radio" name="events-news" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                            <span className="text-sm text-slate-600">News</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name="events-inapp" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-sm text-slate-600">In app</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name="events-email" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-sm text-slate-600">Email</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Email preferences</h3>
                    <p className="text-sm text-slate-600">Manage your email notification preferences</p>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-slate-700">Receiving Emails</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={emailPreferences.receivingEmails.news}
                              onChange={(e) => setEmailPreferences({
                                ...emailPreferences,
                                receivingEmails: { ...emailPreferences.receivingEmails, news: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-600">News</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={emailPreferences.receivingEmails.inApp}
                              onChange={(e) => setEmailPreferences({
                                ...emailPreferences,
                                receivingEmails: { ...emailPreferences.receivingEmails, inApp: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-600">In app</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={emailPreferences.receivingEmails.email}
                              onChange={(e) => setEmailPreferences({
                                ...emailPreferences,
                                receivingEmails: { ...emailPreferences.receivingEmails, email: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-600">Email</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-slate-200">
                        <span className="text-sm font-medium text-slate-700">Owner Support Ending</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={emailPreferences.ownerSupport.news}
                              onChange={(e) => setEmailPreferences({
                                ...emailPreferences,
                                ownerSupport: { ...emailPreferences.ownerSupport, news: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-600">News</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={emailPreferences.ownerSupport.inApp}
                              onChange={(e) => setEmailPreferences({
                                ...emailPreferences,
                                ownerSupport: { ...emailPreferences.ownerSupport, inApp: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-600">In app</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={emailPreferences.ownerSupport.email}
                              onChange={(e) => setEmailPreferences({
                                ...emailPreferences,
                                ownerSupport: { ...emailPreferences.ownerSupport, email: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-600">Email</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-slate-200">
                        <span className="text-sm font-medium text-slate-700">Events in squares</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={emailPreferences.events.news}
                              onChange={(e) => setEmailPreferences({
                                ...emailPreferences,
                                events: { ...emailPreferences.events, news: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-600">News</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={emailPreferences.events.inApp}
                              onChange={(e) => setEmailPreferences({
                                ...emailPreferences,
                                events: { ...emailPreferences.events, inApp: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-600">In app</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={emailPreferences.events.email}
                              onChange={(e) => setEmailPreferences({
                                ...emailPreferences,
                                events: { ...emailPreferences.events, email: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-600">Email</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
