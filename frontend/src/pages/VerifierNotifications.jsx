import React from 'react';
import {
  Bell,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const VerifierNotifications = () => {
  const notifications = [
    {
      id: 'ntf-1',
      title: 'New Priority Case Assigned',
      desc: 'Case RC-2026-0001 (Cross-Institution Duplicate: IIT Delhi vs VJTI Mumbai) assigned to your inspection desk.',
      category: 'ASSIGNMENT',
      time: '15 mins ago',
      unread: true,
      link: '/verifier/cases/RC-2026-0001',
      icon: ShieldAlert,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'ntf-2',
      title: 'Institution Registrar Response Received',
      desc: 'COEP Tech University submitted migration certificate verification response for Case RC-2026-0002.',
      category: 'INSTITUTION_RESPONSE',
      time: '1 hour ago',
      unread: true,
      link: '/verifier/cases',
      icon: Building,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'ntf-3',
      title: 'Document OCR Integrity Flag',
      desc: 'Automated pre-validation detected duplicate SHA-256 certificate uploaded under candidate Rohan Sharma.',
      category: 'AI_ALERT',
      time: '3 hours ago',
      unread: false,
      link: '/verifier/document-verification',
      icon: FileCheck2,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'ntf-4',
      title: 'Legal Escalation Acknowledged',
      desc: 'National Directorate received your formal escalation memo regarding supernumerary seat allocation dispute.',
      category: 'ESCALATION',
      time: '1 day ago',
      unread: false,
      link: '/verifier/cases',
      icon: Clock,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gov-border">
        <div>
          <h1 className="text-xl font-bold text-gov-navy flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>Assigned Tasks & Live Dispatch Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of case assignments, institution nodal responses, and regulatory escalation updates.
          </p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          2 Unread Alerts
        </span>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {notifications.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4.5 shadow-panel transition-all flex items-start space-x-4 ${
                item.unread ? 'border-amber-300 ring-1 ring-amber-100 bg-amber-50/10' : 'border-gov-border'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-gov-navy">{item.title}</h3>
                    {item.unread && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.time}</span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {item.desc}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                  <Link
                    to={item.link}
                    className="text-xs font-bold text-gov-teal hover:underline flex items-center space-x-1"
                  >
                    <span>Take Action</span>
                    <ArrowRight className="w-3.5 h-3.5 inline" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerifierNotifications;
