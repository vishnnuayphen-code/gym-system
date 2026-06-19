import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Image } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Plus, Pencil, Search, CreditCard, Receipt, Download, Loader, Users, Mail, Phone, Calendar, ChevronDown, ChevronUp, Clock, Rocket, Target, ShieldCheck, Check, Activity, DollarSign, Layers, UserCheck, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { nebulaGold } from '../../src/theme/nebulaGold';
import { ScreenHeader } from '../../src/components/nebula/ScreenHeader';
import { GlassCard } from '../../src/components/nebula/GlassCard';
import { GoldButton } from '../../src/components/nebula/GoldButton';
import { SectionLabel } from '../../src/components/nebula/SectionLabel';
import { FormField } from '../../src/components/nebula/FormField';
import { useApiCall } from '../../src/hooks/useApiCall';
import { dashboardService } from '../../src/services/dashboardService';
import { membershipService } from '../../src/services/membershipService';
import { traineeService } from '../../src/services/traineeService';
import { showToast } from '../../src/utils/toast';
import { SkeletonRows } from '../../src/components/reports/SkeletonRows';
import { EmptyState } from '../../src/components/reports/EmptyState';

import { useLocalSearchParams, useRouter } from 'expo-router';

type ReportTab = 'ZREPORT' | 'PLANS' | 'PAYMENTS';

export default function GymAdminReports() {
  const { tab } = useLocalSearchParams<{ tab: ReportTab }>();
  const [activeTab, setActiveTab] = useState<ReportTab>('ZREPORT');

  // Handle deep-linked tabs (e.g., from Dashboard)
  React.useEffect(() => {
    if (tab && ['ZREPORT', 'PLANS', 'PAYMENTS'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);
  const [reportType, setReportType] = useState<'DAILY' | 'MONTHLY'>('DAILY');
  
  // Modals
  const [createPlanModal, setCreatePlanModal] = useState(false);
  const [editPlanModal, setEditPlanModal] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [subscribersMap, setSubscribersMap] = useState<Record<number, any[]>>({});
  const [loadingSubscribers, setLoadingSubscribers] = useState<Record<number, boolean>>({});
  const [recordPaymentModal, setRecordPaymentModal] = useState(false);
  
  // Selection
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [traineeSearchOpen, setTraineeSearchOpen] = useState(false);
  
  // Payment Form States
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  const [traineeSearch, setTraineeSearch] = useState('');
  
  // Form States
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // Plan Form
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planDays, setPlanDays] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  
  const [paymentTraineeId, setPaymentTraineeId] = useState<string | null>(null);
  const [paymentTraineeName, setPaymentTraineeName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [paymentNote, setPaymentNote] = useState('');
  const [traineeMembershipIdForPayment, setTraineeMembershipIdForPayment] = useState<string | number | null>(null);

  // Data Fetching
  const { data: dashboardData, loading: dashLoading, refreshing: dashRefreshing, refetch: refetchDash } = useApiCall(
    () => dashboardService.getOwnerDashboard(), []
  );

  const { data: plans, loading: plansLoading, refreshing: plansRefreshing, refetch: refetchPlans } = useApiCall(
    () => membershipService.getPlans(), []
  );

  const { data: trainees } = useApiCall(
    () => traineeService.getAll(), []
  );

  const { data: payments, loading: paymentsLoading, refreshing: paymentsRefreshing, refetch: refetchPayments } = useApiCall(
    () => selectedTraineeId 
      ? membershipService.getPaymentsForTrainee(selectedTraineeId) 
      : membershipService.getRecentPayments(),
    [selectedTraineeId]
  );

  const reportData = useMemo(() => {
    if (!dashboardData) return null;
    return {
      totalRevenue: dashboardData.totalRevenue || 0,
      totalMembers: dashboardData.totalMembers || 0,
      activeMembers: dashboardData.activeMemberships || 0,
      todaySessions: dashboardData.todaySessions || 0,
      revenueToday: dashboardData.revenueToday || 0,
      revenueMonthly: dashboardData.revenueThisMonth || 0,
      newMembersToday: dashboardData.newMembersToday || 0,
    };
  }, [dashboardData]);

  const totalFromPayments = useMemo(() => 
    payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0
  , [payments]);

  const handleExportPDF = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!reportData) return;
    
    try {
      const now = format(new Date(), 'yyyy-MM-dd HH:mm');
      const html = `
        <html>
          <body style="font-family: monospace; padding: 40px; background: #fff;">
            <h2 style="text-align:center;">[ Z-REPORT : ${reportType} ]</h2>
            <p style="text-align:center; color:#666;">
              DATE: ${format(new Date(), 'yyyy-MM-dd')} | TIME: ${format(new Date(), 'hh:mm a')}
            </p>
            <hr/>
            <table style="width:100%; font-size:16px;">
              <tr>
                <td>TOTAL REVENUE</td>
                <td style="text-align:right; font-weight:bold;">
                  $${reportType === 'DAILY' ? reportData.revenueToday : reportData.revenueMonthly}
                </td>
              </tr>
              <tr><td colspan="2"><hr/></td></tr>
              <tr><td>TOTAL MEMBERS</td><td style="text-align:right;">${reportData.totalMembers}</td></tr>
              <tr><td>ACTIVE MEMBERS</td><td style="text-align:right;">${reportData.activeMembers}</td></tr>
              <tr><td>TODAY'S SESSIONS</td><td style="text-align:right;">${reportData.todaySessions}</td></tr>
              <tr><td>NEW MEMBERS (TODAY)</td><td style="text-align:right;">${reportData.newMembersToday}</td></tr>
              <tr><td>TOTAL PLANS</td><td style="text-align:right;">${plans?.length || 0}</td></tr>
              <tr><td colspan="2"><hr/></td></tr>
            </table>
            <p style="text-align:center; margin-top:40px;">*** END OF REPORT ***</p>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Z-Report ${now}`,
      });
    } catch (e: any) {
      showToast('Failed to export PDF', 'error');
    }
  };

  const handleCreatePlan = async () => {
    if (!planName.trim()) { setModalError('Plan name is required'); return; }
    if (!planPrice || isNaN(parseFloat(planPrice))) { setModalError('Valid price is required'); return; }
    if (!planDays || isNaN(parseInt(planDays))) { setModalError('Duration in days is required'); return; }
    
    try {
      setModalSubmitting(true);
      setModalError(null);
      await membershipService.createPlan({
        name: planName.trim(),
        price: parseFloat(planPrice),
        durationDays: parseInt(planDays),
        description: planDescription.trim() || null,
      });
      showToast('Plan created successfully', 'success');
      refetchPlans();
      setCreatePlanModal(false);
      resetPlanForm();
    } catch (e: any) {
      setModalError(e.message || 'Failed to create plan');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!planName.trim()) { setModalError('Plan name is required'); return; }
    
    try {
      setModalSubmitting(true);
      setModalError(null);
      await membershipService.updatePlan(selectedPlan.id, {
        name: planName.trim(),
        price: parseFloat(planPrice),
        durationDays: parseInt(planDays),
        description: planDescription.trim() || null,
      });
      showToast('Plan updated successfully', 'success');
      refetchPlans();
      setEditPlanModal(false);
      resetPlanForm();
    } catch (e: any) {
      setModalError(e.message || 'Failed to update plan');
    } finally {
      setModalSubmitting(false);
    }
  };

  const togglePlanExpansion = async (planId: number) => {
    if (expandedPlanId === planId) {
      setExpandedPlanId(null);
      return;
    }

    setExpandedPlanId(planId);

    // Fetch subscribers if not already cached
    if (!subscribersMap[planId]) {
      try {
        setLoadingSubscribers(prev => ({ ...prev, [planId]: true }));
        const subs = await membershipService.getSubscribersForPlan(String(planId));
        setSubscribersMap(prev => ({ ...prev, [planId]: subs }));
      } catch (err) {
        console.error(`Failed to fetch subscribers for plan ${planId}`, err);
      } finally {
        setLoadingSubscribers(prev => ({ ...prev, [planId]: false }));
      }
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentTraineeId) { setModalError('Select a trainee'); return; }
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) { setModalError('Valid amount is required'); return; }
    
    try {
      setModalSubmitting(true);
      setModalError(null);
      await membershipService.recordPayment({
        traineeId: paymentTraineeId,
        planId: selectedPlan?.id || '',
        membershipId: traineeMembershipIdForPayment, // Link to specific pending membership
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      showToast('Payment recorded and membership activated!', 'success');
      
      // Refresh data
      if (selectedTraineeId === paymentTraineeId) refetchPayments();
      if (selectedPlan?.id) {
        // Refresh subscribers for this plan
        const subs = await membershipService.getSubscribersForPlan(String(selectedPlan.id));
        setSubscribersMap(prev => ({ ...prev, [selectedPlan.id]: subs }));
      }
      refetchDash();
      
      setRecordPaymentModal(false);
      resetPaymentForm();
    } catch (e: any) {
      setModalError(e.message || 'Failed to record payment');
    } finally {
      setModalSubmitting(false);
    }
  };

  const resetPlanForm = () => {
    setPlanName('');
    setPlanPrice('');
    setPlanDays('');
    setPlanDescription('');
    setModalError(null);
  };

  const resetPaymentForm = () => {
    setPaymentTraineeId(null);
    setPaymentTraineeName('');
    setPaymentAmount('');
    setPaymentMethod('CASH');
    setPaymentNote('');
    setTraineeMembershipIdForPayment(null);
    setModalError(null);
    setTraineeSearchOpen(false);
  };

  const renderTabSelector = () => (
    <View style={styles.tabSelector}>
      {(['ZREPORT', 'PLANS', 'PAYMENTS'] as ReportTab[]).map(tab => (
        <TouchableOpacity
          key={tab}
          onPress={() => {
            setActiveTab(tab);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[
            styles.tabButton,
            activeTab === tab && styles.tabButtonActive
          ]}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === tab && styles.tabButtonTextActive
          ]}>
            {tab === 'ZREPORT' ? 'Z-Report' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Reports" />
      
      {renderTabSelector()}

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={dashRefreshing || plansRefreshing || paymentsRefreshing} 
            onRefresh={() => {
              if (activeTab === 'ZREPORT') refetchDash();
              if (activeTab === 'PLANS') refetchPlans();
              if (activeTab === 'PAYMENTS') refetchPayments();
            }} 
            tintColor={nebulaGold.colors.gold.primary} 
          />
        }
      >
        {activeTab === 'ZREPORT' && (
          <View>
            <View style={styles.methodRow}>
              <TouchableOpacity 
                onPress={() => setReportType('DAILY')}
                style={[styles.methodBtn, reportType === 'DAILY' && styles.methodBtnActive]}
              >
                <Text style={[styles.methodBtnText, reportType === 'DAILY' && styles.methodBtnTextActive]}>Daily</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setReportType('MONTHLY')}
                style={[styles.methodBtn, reportType === 'MONTHLY' && styles.methodBtnActive]}
              >
                <Text style={[styles.methodBtnText, reportType === 'MONTHLY' && styles.methodBtnTextActive]}>Monthly</Text>
              </TouchableOpacity>
            </View>

            {dashLoading ? (
              <ActivityIndicator size="large" color={nebulaGold.colors.gold.primary} style={{ marginTop: 50 }} />
            ) : (
              <View>
                {/* Revenue Overview Card */}
                <View style={styles.revenueCard}>
                  <Text style={styles.zReportTitle}>Total Revenue</Text>
                  <Text style={styles.zReportDate}>
                    {reportType}: {format(new Date(), reportType === 'DAILY' ? 'MMMM d, yyyy' : 'MMMM yyyy')}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <DollarSign size={24} color={nebulaGold.colors.gold.primary} />
                    <Text style={styles.revenueVal}>
                      {reportType === 'DAILY' ? (reportData?.revenueToday?.toLocaleString() || '0') : (reportData?.revenueMonthly?.toLocaleString() || '0')}
                    </Text>
                  </View>
                </View>

                {/* Stat Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <View style={styles.statIconBox}>
                      <Users size={16} color={nebulaGold.colors.gold.primary} />
                    </View>
                    <Text style={styles.statLabel}>Total Members</Text>
                    <Text style={styles.statValueText}>{reportData?.totalMembers || 0}</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statIconBox}>
                      <UserCheck size={16} color={nebulaGold.colors.gold.primary} />
                    </View>
                    <Text style={styles.statLabel}>Active Members</Text>
                    <Text style={styles.statValueText}>{reportData?.activeMembers || 0}</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statIconBox}>
                      <Activity size={16} color={nebulaGold.colors.gold.primary} />
                    </View>
                    <Text style={styles.statLabel}>Today's Sessions</Text>
                    <Text style={styles.statValueText}>{reportData?.todaySessions || 0}</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statIconBox}>
                      <Zap size={16} color={nebulaGold.colors.gold.primary} />
                    </View>
                    <Text style={styles.statLabel}>New Members</Text>
                    <Text style={styles.statValueText}>{reportData?.newMembersToday || 0}</Text>
                  </View>
                </View>

                {/* Plans Overview */}
                <View style={[styles.statCard, { width: '100%', marginBottom: 20 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <View style={styles.statIconBox}>
                        <Layers size={16} color={nebulaGold.colors.gold.primary} />
                      </View>
                      <Text style={styles.statLabel}>Plans Available</Text>
                      <Text style={styles.statValueText}>{plans?.length || 0}</Text>
                    </View>
                    <Receipt size={32} color="rgba(201,168,76,0.1)" />
                  </View>
                </View>
              </View>
            )}

            <GoldButton 
              title="Export Report PDF" 
              variant="ghost" 
              onPress={handleExportPDF}
              leftIcon={<Download size={18} color={nebulaGold.colors.gold.primary} />}
              style={styles.exportButton}
            />
          </View>
        )}

        {activeTab === 'PLANS' && (
          <View>
            <View style={styles.sectionHeader}>
              <SectionLabel label="MEMBERSHIP PLANS" />
              <TouchableOpacity
                onPress={() => { resetPlanForm(); setCreatePlanModal(true); }}
                style={styles.addBtn}
              >
                <Plus size={14} color="#C9A84C" />
                <Text style={styles.addBtnText}>New Plan</Text>
              </TouchableOpacity>
            </View>

            {plansLoading && <SkeletonRows count={3} />}
            {!plansLoading && (!plans || plans.length === 0) && (
              <EmptyState icon={<CreditCard size={28} color="rgba(201,168,76,0.4)" />} message="No membership plans created yet" />
            )}
            {plans?.map((plan: any) => {
              const isExpanded = expandedPlanId === plan.id;
              const planSubscribers = subscribersMap[plan.id] || [];
              const isSubsLoading = loadingSubscribers[plan.id];

              return (
                <View key={plan.id} style={styles.planCard}>
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <TouchableOpacity onPress={() => {
                      setSelectedPlan(plan);
                      setPlanName(plan.name);
                      setPlanPrice(plan.price.toString());
                      setPlanDays(plan.durationDays.toString());
                      setPlanDescription(plan.description || '');
                      setEditPlanModal(true);
                    }}>
                      <Pencil size={16} color="#9E9A8E" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.planMetaRow}>
                    <View style={styles.planPriceBadge}>
                      <Text style={styles.planPriceText}>${plan.price}</Text>
                    </View>
                    <View style={styles.planDurationBadge}>
                      <Text style={styles.planDurationText}>{plan.durationDays} days</Text>
                    </View>
                  </View>

                  <View style={styles.subscriberStatsRow}>
                    <View style={styles.statItem}>
                      <Users size={12} color="#10b981" />
                      <Text style={styles.statText}>{plan.activeSubscriberCount || 0} Active</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Users size={12} color="#64748b" />
                      <Text style={styles.statText}>{plan.subscriberCount || 0} Total</Text>
                    </View>
                  </View>

                  {plan.description && <Text style={styles.planDesc}>{plan.description}</Text>}

                  <TouchableOpacity 
                    onPress={() => togglePlanExpansion(plan.id)}
                    style={styles.expansionToggle}
                  >
                    <View style={styles.expansionToggleLeft}>
                      <Users size={16} color={nebulaGold.colors.gold.primary} />
                      <Text style={styles.expansionToggleText}>Subscribers Overview</Text>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={16} color="#64748b" />
                    ) : (
                      <ChevronDown size={16} color="#64748b" />
                    )}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.subscribersListContainer}>
                      {isSubsLoading ? (
                        <ActivityIndicator size="small" color={nebulaGold.colors.gold.primary} style={{ marginVertical: 20 }} />
                      ) : planSubscribers.length > 0 ? (
                        <View style={styles.subscribersList}>
                          {planSubscribers.map((sub: any) => {
                            const statusColor = sub.membershipStatus === 'ACTIVE' ? '#10b981' : 
                                              sub.membershipStatus === 'PENDING' ? nebulaGold.colors.gold.primary :
                                              sub.membershipStatus === 'EXPIRING' ? '#f59e0b' : '#ef4444';
                            return (
                              <View key={sub.membershipId} style={styles.subscriberItem}>
                                <View style={styles.subItemHeader}>
                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.subItemName}>{sub.traineeName}</Text>
                                    <View style={styles.subItemContact}>
                                      <Mail size={10} color="#64748b" style={{ marginRight: 4 }} />
                                      <Text style={styles.subItemContactText}>{sub.traineeEmail}</Text>
                                    </View>
                                    {sub.traineePhone && (
                                      <View style={styles.subItemContact}>
                                        <Phone size={10} color="#64748b" style={{ marginRight: 4 }} />
                                        <Text style={styles.subItemContactText}>{sub.traineePhone}</Text>
                                      </View>
                                    )}
                                  </View>
                                  <View style={[styles.statusMiniBadge, { 
                                    borderColor: statusColor,
                                    backgroundColor: sub.membershipStatus === 'PENDING' ? 'rgba(201,168,76,0.1)' : 'transparent'
                                  }]}>
                                    <Text style={[styles.statusMiniBadgeText, { color: statusColor }]}>{sub.membershipStatus}</Text>
                                  </View>
                                </View>

                                {sub.membershipStatus === 'PENDING' && (
                                  <TouchableOpacity
                                    onPress={() => {
                                      setPaymentTraineeId(String(sub.traineeId));
                                      setPaymentTraineeName(sub.traineeName);
                                      setPaymentAmount(String(sub.planPrice));
                                      setTraineeMembershipIdForPayment(sub.membershipId); // Need to add this state or just use existing logic
                                      setRecordPaymentModal(true);
                                    }}
                                    style={{
                                      backgroundColor: nebulaGold.colors.gold.primary,
                                      paddingVertical: 6,
                                      paddingHorizontal: 12,
                                      borderRadius: 6,
                                      marginTop: 4,
                                      alignSelf: 'flex-start'
                                    }}
                                  >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                      <CreditCard size={12} color="#12121A" />
                                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#12121A' }}>
                                        Verify & Record Payment
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                )}
                                <View style={styles.subItemFooter}>
                                  <View style={styles.subItemDate}>
                                    <Calendar size={10} color="#64748b" style={{ marginRight: 4 }} />
                                    <Text style={styles.subItemBottomText}>Ends {sub.endDate}</Text>
                                  </View>
                                  <Text style={styles.subItemDaysRemaining}>
                                    {sub.daysRemaining >= 0 ? `${sub.daysRemaining}d left` : `${Math.abs(sub.daysRemaining)}d ago`}
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      ) : (
                        <View style={styles.emptySubState}>
                          <Text style={styles.emptySubText}>No subscribers for this plan</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'PAYMENTS' && (
          <View>
            <View style={styles.sectionHeader}>
              <SectionLabel label={selectedTraineeId ? "PAYMENT HISTORY" : "RECENT PAYMENTS"} />
              <TouchableOpacity
                onPress={() => { resetPaymentForm(); setRecordPaymentModal(true); }}
                style={styles.recordPaymentBtn}
              >
                <Plus size={14} color="#2ECC71" />
                <Text style={styles.recordPaymentBtnText}>Record Payment</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Search size={16} color="#5A5750" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search member to view payments..."
                placeholderTextColor="#5A5750"
                value={traineeSearch}
                onChangeText={setTraineeSearch}
              />
            </View>

            {traineeSearch.length > 0 && (
              <View style={styles.pickerDropdown}>
                <ScrollView nestedScrollEnabled>
                  {trainees
                    ?.filter((t: any) => t.name?.toLowerCase().includes(traineeSearch.toLowerCase()))
                    .map((t: any) => (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => {
                          setSelectedTraineeId(t.id);
                          setTraineeSearch(t.name);
                          setTraineeSearchOpen(false); // Make sure it closes
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={styles.pickerItem}
                      >
                        <Text style={styles.pickerItemName}>{t.name}</Text>
                        <Text style={styles.pickerItemEmail}>{t.email}</Text>
                      </TouchableOpacity>
                    ))
                  }
                </ScrollView>
              </View>
            )}

            {selectedTraineeId && payments && (
              <View style={styles.summaryCard}>
                <View>
                  <Text style={styles.summaryLabel}>Total paid</Text>
                  <Text style={styles.summaryValue}>${totalFromPayments.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryTrailing}>
                  <Text style={styles.summaryLabel}>Transactions</Text>
                  <Text style={styles.summaryTrailingValue}>{payments.length}</Text>
                </View>
              </View>
            )}

            {paymentsLoading && <SkeletonRows count={3} />}
            
            {selectedTraineeId && !paymentsLoading && payments?.length === 0 && (
              <EmptyState 
                icon={<Receipt size={28} color="rgba(201,168,76,0.4)" />} 
                message="No payments recorded for this member" 
              />
            )}
            
            {!selectedTraineeId && !paymentsLoading && payments?.length === 0 && (
              <EmptyState 
                icon={<Search size={28} color="rgba(201,168,76,0.4)" />} 
                message="Search for a member or record a new payment" 
              />
            )}

            {payments?.map((p: any) => {
              const pDate = p.paymentDate || p.date;
              const pMethod = p.paymentMethod || p.method;
              const pStatus = p.paymentStatus || p.status;
              const pPlanName = p.traineeMembership?.membershipPlan?.name || p.planName || 'General Payment';
              const pTraineeName = p.traineeMembership?.trainee?.name || p.traineeName;

              return (
                <View key={p.id} style={[styles.paymentCard, { borderLeftColor: pStatus === 'SUCCESS' || pStatus === 'PAID' ? '#2ECC71' : pStatus === 'PENDING' ? '#F39C12' : '#E74C3C' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentPlanName}>
                      {pPlanName}
                      {pTraineeName && !selectedTraineeId ? ` · ${pTraineeName}` : ''}
                    </Text>
                    <Text style={styles.paymentMeta}>
                      {pDate ? format(parseISO(pDate), 'dd MMM yyyy') : '—'}
                      {pMethod ? ` · ${pMethod}` : ''}
                    </Text>
                    {(p.note || p.transactionReference) && (
                      <Text style={styles.paymentNote} numberOfLines={1}>
                        {p.note || p.transactionReference}
                      </Text>
                    )}
                  </View>
                  <View style={styles.paymentTrailing}>
                    <Text style={styles.paymentAmount}>${(p.amount || 0).toFixed(2)}</Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: pStatus === 'SUCCESS' || pStatus === 'PAID' ? 'rgba(46,204,113,0.15)' : pStatus === 'PENDING' ? 'rgba(243,156,18,0.15)' : 'rgba(231,76,60,0.15)',
                      borderColor: pStatus === 'SUCCESS' || pStatus === 'PAID' ? '#2ECC71' : pStatus === 'PENDING' ? '#F39C12' : '#E74C3C',
                    }]}>
                      <Text style={[styles.statusBadgeText, { color: pStatus === 'SUCCESS' || pStatus === 'PAID' ? '#2ECC71' : pStatus === 'PENDING' ? '#F39C12' : '#E74C3C' }]}>
                        {pStatus}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* MODALS */}
      <Modal visible={createPlanModal || editPlanModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{createPlanModal ? 'Create New Plan' : 'Edit Plan'}</Text>
            <TouchableOpacity onPress={() => createPlanModal ? setCreatePlanModal(false) : setEditPlanModal(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <FormField label="Plan Name" value={planName} onChangeText={setPlanName} placeholder="e.g. 1 Month Pro" />
            <FormField label="Price ($)" value={planPrice} onChangeText={setPlanPrice} placeholder="e.g. 49.99" keyboardType="numeric" />
            <FormField label="Duration (Days)" value={planDays} onChangeText={setPlanDays} placeholder="e.g. 30" keyboardType="numeric" />
            <FormField label="Description (Optional)" value={planDescription} onChangeText={setPlanDescription} placeholder="What's included in this plan?" multiline numberOfLines={3} />
            
            {modalError && <Text style={styles.errorText}>{modalError}</Text>}
            
            <GoldButton 
              title={modalSubmitting ? "Saving..." : (createPlanModal ? "Create Plan" : "Save Changes")}
              onPress={createPlanModal ? handleCreatePlan : handleUpdatePlan}
              disabled={modalSubmitting}
              style={{ marginTop: 24 }}
            />
          </ScrollView>
        </View>
      </Modal>


      <Modal visible={recordPaymentModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <TouchableOpacity onPress={() => setRecordPaymentModal(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={{ marginBottom: 12 }}>
              <FormField 
                label="Search Trainee" 
                value={paymentTraineeName} 
                onChangeText={(val) => { 
                  setPaymentTraineeName(val); 
                  if(!val) {
                    setPaymentTraineeId(null);
                    setTraineeMembershipIdForPayment(null);
                  }
                  setTraineeSearchOpen(true);
                }} 
                placeholder="Type member name..." 
                onFocus={() => setTraineeSearchOpen(true)}
              />
              {traineeSearchOpen && (
                <View style={[styles.inlinePicker, { maxHeight: 250 }]}>
                  <ScrollView nestedScrollEnabled={true}>
                    {trainees?.filter((t: any) => 
                      !paymentTraineeName || t.name.toLowerCase().includes(paymentTraineeName.toLowerCase())
                    ).map((t: any) => (
                      <TouchableOpacity 
                        key={t.id} 
                        style={[styles.inlinePickerItem, paymentTraineeId === t.id && { backgroundColor: 'rgba(201,168,76,0.15)' }]} 
                        onPress={() => { 
                          setPaymentTraineeId(t.id); 
                          setPaymentTraineeName(t.name);
                          setTraineeSearchOpen(false);
                          if (t.latestMembershipId) {
                            setTraineeMembershipIdForPayment(t.latestMembershipId);
                          }
                        }}
                      >
                        <View>
                          <Text style={styles.pickerItemName}>{t.name}</Text>
                          <Text style={styles.pickerItemEmail}>{t.email || 'No email'}</Text>
                        </View>
                        {paymentTraineeId === t.id && <Check size={18} color="#C9A84C" />}
                      </TouchableOpacity>
                    ))}
                    {(trainees?.length === 0 || !trainees) && (
                      <Text style={[styles.emptyText, { padding: 20 }]}>No members found</Text>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            <FormField label="Amount ($)" value={paymentAmount} onChangeText={setPaymentAmount} placeholder="0.00" keyboardType="numeric" />
            
            <SectionLabel label="PAYMENT METHOD" style={{ marginTop: 16, marginBottom: 8 }} />
            <View style={styles.methodRow}>
              {(['CASH', 'CARD', 'TRANSFER'] as const).map(m => (
                <TouchableOpacity 
                  key={m} 
                  onPress={() => setPaymentMethod(m)}
                  style={[styles.methodBtn, paymentMethod === m && styles.methodBtnActive]}
                >
                  <Text style={[styles.methodBtnText, paymentMethod === m && styles.methodBtnTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <FormField label="Note (Optional)" value={paymentNote} onChangeText={setPaymentNote} placeholder="e.g. Month 1 fee" multiline numberOfLines={2} />
            
            {modalError && <Text style={styles.errorText}>{modalError}</Text>}
            
            <GoldButton 
              title={modalSubmitting ? "Recording..." : "Record Payment"}
              onPress={handleRecordPayment}
              disabled={modalSubmitting}
              style={{ marginTop: 24 }}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  tabSelector: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: nebulaGold.colors.background.secondary,
    padding: 6,
    borderRadius: 32,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    ...nebulaGold.colors.shadow.light,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 28,
  },
  tabButtonActive: {
    backgroundColor: '#000000',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  methodRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  methodBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    backgroundColor: nebulaGold.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodBtnActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  methodBtnText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '700',
  },
  methodBtnTextActive: {
    color: '#FFFFFF',
  },
  revenueCard: {
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    ...nebulaGold.colors.shadow.light,
  },
  zReportTitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  zReportDate: {
    fontSize: 12,
    color: '#C7C7CC',
    marginBottom: 16,
  },
  revenueVal: {
    fontSize: 44,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValueText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#000000',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planCard: {
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    ...nebulaGold.colors.shadow.light,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  planMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  planPriceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  planPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
  planDurationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  planDurationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  subscriberStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  planDesc: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 16,
  },
  expansionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    padding: 14,
    borderRadius: 16,
    marginTop: 4,
  },
  expansionToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expansionToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  subscribersListContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  subscribersList: {
    gap: 10,
  },
  subscriberItem: {
    backgroundColor: '#F9F9FB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  subItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subItemContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  subItemContactText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusMiniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusMiniBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  subItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
    marginTop: 8,
  },
  subItemDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subItemBottomText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  subItemDaysRemaining: {
    fontSize: 11,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    marginLeft: 10,
  },
  summaryCard: {
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...nebulaGold.colors.shadow.light,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
  },
  summaryTrailing: {
    alignItems: 'flex-end',
  },
  summaryTrailingValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
  },
  paymentCard: {
    backgroundColor: nebulaGold.colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentPlanName: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '700',
  },
  paymentMeta: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  paymentNote: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  paymentTrailing: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
  modalClose: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  exportButton: {
    marginTop: 20,
    backgroundColor: '#000000',
    height: 56,
    borderRadius: 28,
  },
  recordPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  recordPaymentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  pickerDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBEBF0',
    marginTop: -8,
    marginBottom: 16,
    maxHeight: 250,
    ...nebulaGold.colors.shadow.light,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  pickerItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  pickerItemEmail: {
    fontSize: 12,
    color: '#8E8E93',
  },
  inlinePicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    marginTop: 8,
  },
  inlinePickerItem: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  selectionSummary: {
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 20,
  },
  summaryMain: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginTop: 4,
  },
  summarySub: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  emptySubState: {
    padding: 20,
    alignItems: 'center',
  },
  emptySubText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});
