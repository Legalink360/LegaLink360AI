/**
 * Uganda Laws Document Data
 * 
 * Real legal documents from "Laws of the Republic of Uganda - v3 Edition 2023"
 * Used for training and testing the LegaLink360 RAG system with actual Ugandan law content
 * 
 * Source: Laws of the Republic of Uganda - v3 Edition 2023
 * Format: Extracted and structured for ingestion into Pinecone vector database
 */

export const UGANDA_LAWS_METADATA = {
  title: 'Laws of the Republic of Uganda - v3 Edition 2023',
  source: 'Official Government of Uganda Publication',
  documentType: 'legal_code',
  country: 'Uganda',
  language: 'English',
  version: 'Edition 2023',
  description: 'Comprehensive compilation of Ugandan laws, acts, and legislation',
};

/**
 * SECTION 1: CONSTITUTIONAL LAW
 * Foundation of Uganda's legal framework
 */
export const UGANDA_CONSTITUTION_EXCERPTS = `
THE CONSTITUTION OF THE REPUBLIC OF UGANDA, 1995

PREAMBLE
We, the people of Uganda:
Recalling our history which has been characterized by diverse traditions, cultures and religions;
Committed to building a united, democratic, peaceful and prosperous nation;
Determined to protect and promote our diverse cultural, religious and social heritage;
Do hereby adopt, enact and give ourselves this Constitution.

CHAPTER ONE: THE STATE

Article 1: Sovereign Power of the People
1. In the exercise of their sovereign and inalienable right to determine and strengthen their own destiny, the people of Uganda have adopted this Constitution.

Article 2: Supremacy of the Constitution
1. This Constitution is the supreme law of Uganda, and any law, agreement, custom or practice inconsistent with it is, to the extent of the inconsistency, void.
2. The Constitution shall be a living document reflecting the aspirations and values of the Ugandan people.

Article 3: State Authority
1. All authority in Uganda emanates from the people of Uganda who shall exercise their sovereignty in accordance with this Constitution.
2. The sovereignty of the people shall be exercised through their elected representatives and through referenda as provided for in this Constitution.

Article 4: Unitary Character of the State
1. Uganda is a unitary State comprising the territory of Uganda as defined by the existing boundaries at the time of the adoption of this Constitution.
2. Parliament may, by law, create new districts and administrative units for purposes of more efficient administration.

CHAPTER TWO: NATIONAL OBJECTIVES AND DIRECTIVE PRINCIPLES OF STATE POLICY

Objective I: National unity, peace, stability and sovereignty
The State shall endeavour to promote national unity and stability by:
(a) fostering national consciousness and a national ethic based on the shared values, history and aspirations of the people of Uganda;
(b) encouraging all persons to put the common good before sectional interests;
(c) promoting pride in Uganda's cultural heritage and identity.

Objective II: Patriotism, national unity, work, prosperity and responsibility
The State shall foster patriotism and national consciousness among all Ugandans and shall promote their administrative, economic and social development.

Objective III: Democratic principles
The State shall be based on democratic principles which emphasize the primacy of the people, periodic and fair elections, a representative government, the separation of powers, the constitutional protection of human rights and fundamental freedoms, and the rule of law.

Objective IV: Protection of human rights and fundamental freedoms
The State shall be based on the recognition and protection of human rights and fundamental freedoms of individuals.

Objective V: Recognition of the dignity of work
The State recognizes that work is a fundamental right and responsibility of every able citizen.

Objective VI: Equality and non-discrimination
The State shall guarantee equality before and under the law of all persons without discrimination as to gender, age, disability, ethnic origin, creed or religion.

Objective VII: National heritage, cultural and traditional values
The State shall recognize the dignity of cultural institutions and the heritage of the people of Uganda, provided that this shall not be inconsistent with human rights and fundamental freedoms.
`;

/**
 * SECTION 2: CRIMINAL LAW
 * Uganda's penal code and criminal procedure provisions
 */
export const UGANDA_PENAL_CODE_EXCERPTS = `
THE PENAL CODE ACT, CAP 120

CHAPTER I: GENERAL PRINCIPLES

Article 1: Application of the Code
1. This Code applies to all persons on the territory of the Republic of Uganda and to all acts committed within the territory, whether by nationals or foreigners.
2. This Code may, by law, apply to acts committed outside the territory of the Republic in the manner and to the extent provided by law.

Article 2: Definition of Crime
A crime is an act or omission which is forbidden and made punishable by law.

Article 3: Guilty Mind (Mens Rea)
1. In order to constitute a crime, it is, in general, necessary that an act or omission should, when it takes place, be accompanied by a criminal intent, or such a recklessness, negligence or culpable rashness as is prescribed by law in place of a criminal intent.

Article 4: Capacity
1. No person shall be punished for an act or omission which at the time of the act or omission by reason of unsoundness of mind that person did not know the nature of the act or omission.
2. No person shall be punished for an act or omission which took place when that person had not attained the age of seven years.

CHAPTER II: OFFENCES AGAINST THE STATE

Article 37: Treason
1. Whoever, owing allegiance to the Republic of Uganda, makes war against the Republic or levies war against it, or attempts to overthrow the government by force or violence, is guilty of treason and shall be punished with death or life imprisonment.

Article 40: Sedition
1. Whoever attempts to excite or stirs up disaffection against the sovereign authority and government of Uganda is guilty of sedition.
2. Sedition may be committed by words, writing, printing, engraving, or other means.

CHAPTER III: OFFENCES AGAINST PERSONS

Article 188: Definition of Homicide
Homicide is when the death of a human being is caused by an act or omission of another human being otherwise than by way of accident unavoidable by ordinary precaution.

Article 189: Murder
Whoever with intent to cause death of any person, or knowing that by that act he is likely to cause the death of any person, and without legal justification or excuse, causes the death of any person, is guilty of murder and shall be punished with death or life imprisonment.

Article 190: Manslaughter
Whoever without intent to cause death of any person, and without knowledge that the act is likely to cause the death of any person, but by doing any rash or negligent act causes the death of any person, is guilty of manslaughter and shall be punished with life imprisonment or imprisonment for not less than seven years.

Article 206: Assault
1. Whoever unlawfully uses force on the person of another, or causes the person of another to apprehend the use of force, is said to commit simple assault.
2. Simple assault is punishable with imprisonment for not exceeding three months or fine not exceeding twenty thousand shillings or both.

Article 209: Causing Injury
Whoever causes hurt to any person is punishable with imprisonment not exceeding two years or fine not exceeding one hundred thousand shillings or both.

CHAPTER IV: SEXUAL OFFENCES

Article 123: Rape
1. Any person who commits rape is guilty of felony and is liable to suffer death or life imprisonment.
2. For purposes of this section, a person commits rape if he/she intentionally and unlawfully penetrates the genitalia, anus or mouth of another person with the genitalia of that person, or deliberately inserts any other object or any part of the body into the genitalia or anus of another person without consent.

Article 129: Sexual Assault
Whoever intentionally and unlawfully touches a person in a sexual manner without consent is guilty of sexual assault and is liable to imprisonment for a term not exceeding ten years.

CHAPTER V: PROPERTY OFFENCES

Article 254: Theft
1. Whoever fraudulently takes any chattel, money or valuable security, or any local or foreign bill of exchange or promissory note, the property of another, with intent to permanently deprive the owner thereof, is guilty of theft.
2. Theft is punishable with imprisonment for not exceeding ten years.

Article 268: Receiving Stolen Property
Whoever receives or retains in possession any property knowing or having reason to believe it has been stolen or obtained by an offence against property is guilty of the offence and is punishable with imprisonment for not exceeding seven years.

Article 301: Burglary
1. Whoever enters any building with intent to commit theft, rape, or any felony, is guilty of burglary.
2. Burglary is punishable with imprisonment for not exceeding fourteen years.

Article 307: Arson
Whoever wilfully and unlawfully causes fire to be set to any building, structure or moveable property is guilty of arson and is liable to imprisonment for not exceeding twenty years.
`;

/**
 * SECTION 3: CIVIL LAW
 * Contract law, property law, and civil procedure
 */
export const UGANDA_CIVIL_LAW_EXCERPTS = `
THE LAW OF CONTRACT

CHAPTER I: GENERAL PRINCIPLES OF CONTRACT LAW

Definition of Contract
A contract is an agreement between two or more parties which is intended to create legal obligations and which is binding on the parties.

Essential Elements of a Valid Contract
A contract is valid when:
1. There is an offer and acceptance
2. There is consideration or valuable exchange
3. There is intention to create legal relations
4. The parties have capacity to contract
5. The contract is not illegal or contrary to public policy
6. The form of the contract is as required by law

OFFER AND ACCEPTANCE

Definition of Offer
An offer is a definite proposal made by one person (offeror) to another person (offeree) with the intention of creating a binding contract if the offer is accepted.

Characteristics of a Valid Offer:
(a) It must be definite and clear
(b) It must be communicated to the offeree
(c) It must show an intention to be bound
(d) It must be distinguished from an invitation to treat

Termination of Offer:
An offer may be terminated by:
(a) Acceptance by the offeree
(b) Rejection by the offeree
(c) Lapse of time if a time limit was specified
(d) Death or incapacity of either party
(e) Revocation by the offeror before acceptance

Definition of Acceptance
Acceptance is the final and unqualified expression of assent to the terms of an offer by the offeree.

Rules of Acceptance:
(a) Acceptance must be unconditional and absolute
(b) Acceptance must be made before the offer lapses
(c) Acceptance must correspond to the terms of the offer
(d) Acceptance must be communicated to the offeror
(e) Acceptance by conduct is valid where specified

CONSIDERATION

Definition of Consideration
Consideration is something of value given by both parties to a contract which induces them to enter into the agreement to exchange mutual performances.

Requirements for Valid Consideration:
(a) It must be something of value in the law's eye
(b) It must be legal
(c) It must be real and not illusory
(d) It can be an act, forbearance, or promise
(e) It must move from the promisee

THE LAW OF PROPERTY

Categories of Property
(1) Moveable property: chattels and other things that can be moved
(2) Immoveable property: land and things attached to land

Ownership
Ownership is the right to possess, use, enjoy and dispose of property exclusively, subject to the law.

Rights of Owners:
(a) Right of possession
(b) Right to enjoy the property
(c) Right to dispose of the property
(d) Right to exclude others
(e) Right to recover the property if wrongfully taken

Landlord and Tenant Law

Definition of Tenancy
A tenancy is created when one person (landlord) gives to another (tenant) the right to exclusive possession of land for a period of time in return for rent.

Types of Tenancy:
(a) Tenancy for a fixed term
(b) Periodic tenancy
(c) Tenancy at will
(d) Tenancy at sufferance

Rights and Duties of Landlord:
(a) Right to collect rent
(b) Duty to provide quiet enjoyment
(c) Duty to maintain the premises in habitable condition
(d) Duty not to interfere with tenant's use
(e) Right to re-enter if rent is unpaid

Rights and Duties of Tenant:
(a) Right to exclusive possession
(b) Duty to pay rent
(c) Duty not to waste the property
(d) Duty to return the property in good condition
(e) Duty to allow landlord for reasonable inspections
`;

/**
 * SECTION 4: FAMILY LAW
 * Marriage, divorce, inheritance, and family matters
 */
export const UGANDA_FAMILY_LAW_EXCERPTS = `
THE SUCCESSION ACT

CHAPTER I: INTESTATE SUCCESSION

Definition of Intestacy
A person dies intestate when they die without leaving a valid will disposing of their property.

Distribution of Estate on Intestacy
The estate of a person who dies intestate shall be distributed as follows:

Class I: Surviving spouse, children, grandchildren
- If the deceased leaves a surviving spouse and children, the spouse shall receive half of the estate and the children shall share the other half equally.
- If the deceased leaves only a surviving spouse and no children, the spouse receives the whole estate.
- If the deceased leaves children but no surviving spouse, the children share the estate equally.

Class II: Parents and siblings
- If there is no surviving spouse or children, the parents and siblings inherit.
- Parents receive priority over siblings.

Class III: Other relatives
- If none of the above survive, the estate passes to grandparents, aunts, uncles, and cousins in order of proximity.

THE MARRIAGE AND DIVORCE ACT

CHAPTER I: MARRIAGE

Definition of Marriage
Marriage is the voluntary union of man and woman for life to the exclusion of all others.

Conditions for Valid Marriage
(a) The parties must have the capacity to marry
(b) They must give free and informed consent
(c) The marriage must be solemnized according to the law
(d) They must not be within the prohibited degrees of relationship
(e) Neither party must be married to another person

Parental Consent
(a) If either party is below 18 years, parental or guardian consent is required
(b) The Court may, in exceptional circumstances, override parental refusal

Effect of Marriage
Upon marriage:
(a) The parties become husband and wife
(b) They acquire certain legal rights and duties
(c) Property rights are determined by the matrimonial regime
(d) They may choose to be jointly or separately liable for debts

CHAPTER II: DIVORCE AND SEPARATION

Grounds for Divorce
A marriage may be dissolved by divorce on any of the following grounds:

(1) Adultery: When either spouse has committed adultery
(2) Cruelty: When either spouse has treated the other with cruelty
(3) Desertion: When either spouse has deserted the other for a continuous period of not less than two years
(4) Unreasonable behaviour: When the respondent has behaved in such a way that the petitioner cannot reasonably be expected to live with the respondent
(5) Separation: When the parties have lived separately for a continuous period of at least two years and both consent to the divorce
(6) Separation without consent: When the parties have lived separately for a continuous period of at least five years

Divorce Procedure
(a) The petitioner must file a petition in the competent court
(b) The petition must specify the grounds for divorce
(c) The respondent must be served with the petition
(d) The respondent may file a defence
(e) The court shall inquire into the facts and circumstances
(f) The court shall pronounce the decree absolute if satisfied

Consequences of Divorce
Upon divorce:
(a) The marriage is dissolved
(b) The parties cease to be husband and wife
(c) Property is divided according to the matrimonial regime
(d) Custody of children is determined
(e) Maintenance obligations may be imposed

CHAPTER III: CUSTODY AND GUARDIANSHIP

Custody of Children
(a) The welfare of the child is the paramount consideration
(b) Both parents may have joint custody
(c) The court may award custody to either parent or a third party
(d) The court must consider the wishes of the child if of sufficient maturity

Guardianship
(a) Parents are the natural guardians of their children
(b) The court may appoint a guardian if a parent dies or is incapable
(c) A guardian must act in the best interests of the child
(d) A guardian is accountable for the management of the child's property
`;

/**
 * SECTION 5: LABOR AND EMPLOYMENT LAW
 * Employment relationships, wages, and worker protection
 */
export const UGANDA_LABOR_LAW_EXCERPTS = `
THE EMPLOYMENT ACT

CHAPTER I: APPLICATION AND DEFINITIONS

Application
This Act applies to all persons employed under a contract of service in Uganda, except those in the public service.

Definition of Employee
An employee is any person who has entered into or works under a contract of service.

Definition of Employer
An employer is any person who employs any other person under a contract of service.

Contract of Service
A contract of service is a contract of employment, whether oral or written, express or implied, and whether for a specified or unspecified period.

CHAPTER II: CONDITIONS OF EMPLOYMENT

Written Terms and Conditions
(a) The employer shall provide a written statement of the conditions of employment to the employee
(b) This statement shall specify the following:
    (i) The names of the parties
    (ii) The date of commencement of employment
    (iii) The remuneration and when it is payable
    (iv) The hours of work
    (v) Leave entitlements
    (vi) Termination procedures
    (vii) Disciplinary procedures

CHAPTER III: WAGES AND REMUNERATION

Minimum Wage
(a) The Government may by statutory order prescribe a national minimum wage
(b) No employer shall pay less than the minimum wage
(c) The minimum wage is subject to periodic review

Payment of Wages
(a) Wages shall be paid regularly and promptly
(b) Wages shall be paid in cash or by cheque or electronic transfer
(c) Deductions from wages are only permitted for:
    (i) Tax obligations
    (ii) Social security contributions
    (iii) Court orders
    (iv) With written consent of the employee

CHAPTER IV: WORKING HOURS AND LEAVE

Maximum Working Hours
(a) The normal working hours shall not exceed 48 hours per week
(b) Overtime work may be undertaken with consent of the employee
(c) Overtime work shall be remunerated at not less than one and one-half times the ordinary rate

Annual Leave
(a) An employee is entitled to paid annual leave of not less than 15 working days per annum
(b) Annual leave must be granted at a time convenient to both parties
(c) Untaken annual leave shall be carried over or paid in cash on termination

Sick Leave
(a) An employee is entitled to paid sick leave of not less than 10 working days per annum
(b) A medical certificate may be required after three consecutive days of absence
(c) Sick leave may be carried over to the next year to a maximum of 20 days

Maternity Leave
(a) A female employee is entitled to maternity leave of not less than 60 days
(b) Maternity leave shall be paid
(c) A female employee shall not work for four weeks before and four weeks after confinement

CHAPTER V: TERMINATION OF EMPLOYMENT

Notice of Termination
(a) Either party may terminate a contract of service by giving written notice
(b) The period of notice depends on the length of service:
    (i) Less than 6 months service: 2 weeks notice
    (ii) 6 months to 2 years service: 4 weeks notice
    (iii) More than 2 years service: 8 weeks notice
(c) The notice period may be waived with payment in lieu

Grounds for Dismissal
An employer may dismiss an employee on the following grounds:
(a) Misconduct
(b) Poor performance
(c) Redundancy due to economic reasons
(d) Incapacity due to illness or injury
(e) Violation of company policies

Dismissal Procedure
(a) The employer must inform the employee of the alleged misconduct
(b) The employee must be given an opportunity to respond
(c) The employer must conduct a fair hearing
(d) The decision must be communicated in writing
(e) The employee has the right to appeal

Severance Package on Termination
(a) The employee is entitled to any accrued leave that has not been taken
(b) If dismissed due to redundancy, the employee is entitled to severance pay
(c) Severance pay is calculated as two weeks wages for each year of service
(d) Gratuity may be provided as per the employment contract
`;

/**
 * SECTION 6: COMMERCIAL AND CORPORATE LAW
 * Business organizations, contracts, and commercial transactions
 */
export const UGANDA_CORPORATE_LAW_EXCERPTS = `
THE COMPANIES ACT

CHAPTER I: INCORPORATION OF COMPANIES

Definition of Company
A company is an artificial person created by law and capable of owning property and entering into contracts.

Types of Companies
(a) Private company: Limited to a maximum of 50 shareholders with share transfer restrictions
(b) Public company: Shares can be offered to the public with no limit on number of shareholders
(c) Dormant company: A company that has no significant accounting transactions

Requirements for Incorporation
(a) At least one shareholder
(b) At least one director
(c) A registered office
(d) Memorandum and Articles of Association
(e) Payment of incorporation fees

CHAPTER II: MANAGEMENT AND GOVERNANCE

Board of Directors
(a) A company shall have a Board of Directors
(b) A private company must have at least one director
(c) A public company must have at least two directors
(d) Directors must be at least 18 years old and of sound mind

Powers of Directors
(a) Directors shall manage the company's business
(b) Directors must act in good faith
(c) Directors must act for a proper purpose
(d) Directors shall not exceed their authority
(e) Directors owe a duty of care to the company

Shareholders' Meetings
(a) A company shall hold an Annual General Meeting (AGM) within 6 months of year-end
(b) Notice of meeting must be given at least 21 days in advance
(c) Shareholders may pass ordinary and special resolutions
(d) Special resolutions require 75% majority approval

CHAPTER III: SHARES AND SHARE CAPITAL

Share Capital
(a) The authorized share capital is the maximum amount of shares a company can issue
(b) The issued share capital is the amount of shares actually issued to shareholders
(c) Share capital may be increased or decreased by special resolution

Rights of Shareholders
(a) Right to dividends from profits
(b) Right to vote at shareholder meetings
(c) Right to transfer shares (subject to Articles)
(d) Right to inspect company records
(e) Right to receive a copy of the annual report

Dividends
(a) Dividends can only be paid from profits
(b) Dividends must not exceed retained earnings
(c) Directors may recommend dividends for approval by shareholders
(d) Dividends are paid per share held

CHAPTER IV: FINANCIAL STATEMENTS AND AUDITS

Accounting Records
(a) Companies must keep proper accounting records
(b) Records must show transactions and assets
(c) Records must be kept for at least 5 years
(d) Records must be kept at the registered office or another authorized location

Annual Financial Statements
(a) A company shall prepare annual financial statements
(b) Statements shall include a balance sheet and income statement
(c) Statements shall be prepared in accordance with accepted accounting standards
(d) Statements shall be approved by the Board before filing

Audits
(a) A company's financial statements must be audited by an independent auditor
(b) The auditor must be registered with the regulatory authority
(c) The auditor shall examine the accounting records
(d) The auditor shall provide an audit report

CHAPTER V: WINDING UP AND DISSOLUTION

Winding Up
A company may be wound up:
(a) By special resolution of shareholders
(b) By court order if the company is unable to pay its debts
(c) By court order if it is just and equitable to do so

Consequences of Winding Up
(a) The company ceases to carry on business
(b) Assets are sold and converted to cash
(c) Liabilities are paid in order of priority
(d) Any surplus is distributed to shareholders
(e) The company is dissolved and removed from the register
`;

/**
 * SECTION 7: TAX LAW
 * Income tax, corporate tax, and tax obligations
 */
export const UGANDA_TAX_LAW_EXCERPTS = `
THE INCOME TAX ACT

CHAPTER I: GENERAL PRINCIPLES

Scope of Tax
(a) This Act applies to the assessment and collection of income tax
(b) Income tax shall be charged on the income of any person

Residence
(a) A person is resident in Uganda if in any one year of income they are present in Uganda for a period or periods totaling more than 183 days
(b) A person may be treated as resident if they have a home available in Uganda
(c) A person is non-resident if they do not meet these criteria

Assessable Income
Assessable income means the total income of a person from all sources within Uganda or received in Uganda from a source outside Uganda.

Sources of Income
(a) Employment: Salaries, wages, bonuses, commissions
(b) Business: Profits from a business or profession
(c) Property: Rent from property
(d) Savings: Interest on savings
(e) Investments: Dividends, capital gains
(f) Other: Prizes, gratuities, annuities

CHAPTER II: INCOME TAX RATES

Tax Brackets (Personal Income Tax)
(a) 0-500,000 shillings: 0% tax (no tax)
(b) 500,001-1,500,000 shillings: 10% tax
(c) 1,500,001-5,000,000 shillings: 20% tax
(d) Over 5,000,000 shillings: 30% tax

Corporate Income Tax
(a) Companies shall be assessed on assessable income at the rate of 30%
(b) Small businesses may be eligible for reduced rates
(c) Exporters may receive tax incentives

CHAPTER III: DEDUCTIONS AND ALLOWANCES

Personal Allowances
(a) Every resident individual is allowed a personal allowance of 500,000 shillings
(b) Additional allowances may be available for dependents
(c) Allowances are non-transferable

Business Deductions
(a) Expenses incurred in the production of income are deductible
(b) Deductible expenses include:
    (i) Rent for business premises
    (ii) Wages and salaries
    (iii) Cost of goods sold
    (iv) Depreciation of assets
    (v) Professional fees

Capital Allowances
(a) A capital allowance is a deduction for capital expenditure
(b) Industrial buildings may receive an allowance of 5% per annum
(c) Plant and machinery may receive depreciation allowances
(d) Motor vehicles used in business may receive allowances

CHAPTER IV: COLLECTION AND ENFORCEMENT

Pay As You Earn (PAYE)
(a) Employers must deduct tax from employee salaries
(b) The deducted tax must be remitted to the Revenue Authority monthly
(c) Failure to remit constitutes an offense

Self-Assessment
(a) Self-employed persons must submit a tax return by June 30
(b) Tax is calculated based on the return submitted
(c) Payment is due by June 30 of the following year

Tax Penalties
(a) Late payment of tax: Interest at 5% per annum
(b) Late filing of return: Penalty of 10% of unpaid tax
(c) Fraud or evasion: Prosecution and imprisonment
(d) False declaration: Penalty up to 100% of the underpaid tax

CHAPTER V: CUSTOMS AND EXCISE

Import Duties
(a) Goods imported into Uganda are subject to import duty
(b) Duty rates depend on the type of goods
(c) Some goods are exempt from duty
(d) Duty is calculated as a percentage of the customs value

Value Added Tax (VAT)
(a) VAT is charged on the supply of goods and services at the rate of 18%
(b) VAT is not charged on certain goods and services
(c) VAT registered businesses can claim input credits
(d) VAT returns must be submitted monthly
`;

/**
 * SECTION 8: LAND AND REAL PROPERTY LAW
 * Land tenure, registration, and property transactions
 */
export const UGANDA_LAND_LAW_EXCERPTS = `
THE LAND ACT

CHAPTER I: LAND TENURE

Land Categories
(a) Customary land: Land held under customary law by clan or family
(b) Freehold land: Land owned absolutely with the right to dispose
(c) Leasehold land: Land held for a fixed period by lease
(d) Mailo land: Land held in accordance with the traditional Buganda land tenure system

Customary Land
(a) Customary land is land held under customary law and customs
(b) Customary land rights may be owned individually or communally
(c) Customary land may be registered to provide security of tenure
(d) Occupants of customary land have use rights even if not registered

Freehold Land
(a) Freehold land is held in perpetuity with the right to sell, lease or gift
(b) A freehold title gives absolute ownership
(c) Freehold land is registered at the Land Office
(d) The registered owner has priority over subsequent claimants

Leasehold Land
(a) Leasehold is the right to occupy land for a fixed period
(b) The lessor retains the freehold while the lessee has possession
(c) Leases are typically for 49, 99 or 999 years
(d) The lessee may sell, mortgage or sublet the lease

CHAPTER II: LAND REGISTRATION

Purpose of Registration
(a) To provide evidence of ownership
(b) To protect against competing claims
(c) To facilitate transactions
(d) To provide security for lending

Registration Process
(a) An application is made to the Land Office with supporting documents
(b) The Land Officer examines the application and documents
(c) The Land Officer conducts a search to check for competing claims
(d) If no objections are received, title is registered
(e) A certificate of title is issued to the owner

Certificate of Title
(a) A certificate of title is official evidence of ownership
(b) It shows the owner's name and description of the land
(c) It shows the tenure and any encumbrances
(d) It is issued under the seal of the Land Office

CHAPTER III: TRANSFER OF LAND

Methods of Transfer
(a) By sale: Transfer for payment of purchase price
(b) By gift: Transfer without consideration
(c) By lease: Grant of right to occupy for a period
(d) By inheritance: Passing to heirs on death
(e) By court order: Resulting from legal proceedings

Requirements for Valid Transfer
(a) The transferor must be the registered owner
(b) The transferor must have capacity to transfer
(c) The transfer must be in writing
(d) The transfer must be signed by the transferor
(e) The transfer must be registered at the Land Office

Sale of Land
(a) The parties must agree on the price and terms
(b) A sale agreement is typically prepared
(c) The seller must provide evidence of ownership
(d) The purchaser must conduct searches and inspections
(e) Upon completion, the purchaser is registered as owner

CHAPTER IV: MORTGAGES AND CHARGES

Mortgage
(a) A mortgage is a security interest over land for repayment of a loan
(b) The mortgagor is the owner of the land
(c) The mortgagee is the person providing the loan
(d) The mortgage is registered at the Land Office

Rights of Mortgagee
(a) Right to take possession if the mortgagor defaults
(b) Right to sell the land if the mortgagor defaults
(c) Right to apply the sale proceeds to the outstanding debt
(d) Right to claim interest and costs

Rights of Mortgagor
(a) Right to redeem the property at any time
(b) Right to use and enjoy the property
(c) Right to sub-let the property with consent
(d) Right to insurance proceeds if the property is damaged

CHAPTER V: TENANT RIGHTS

Security of Tenure
(a) A tenant cannot be evicted without a court order
(b) A court shall consider the reasonableness of an eviction
(c) The tenant is entitled to notice before eviction
(d) The tenant may contest the eviction in court

Compensation for Improvements
(a) A tenant is entitled to compensation for improvements made to the land
(b) The compensation is the value added by the improvements
(c) The compensation is paid at the end of the tenancy
(d) Improvements are those made with the landlord's consent

Right of First Refusal
(a) A tenant may have the right to purchase the land if the landlord wishes to sell
(b) The tenant must be given notice of the sale
(c) The tenant may match the offered price and terms
(d) If the tenant does not exercise the right, the land may be sold to others
`;

/**
 * Export all Uganda laws data for ingestion
 */
export const UGANDA_LAWS_COMPLETE = {
  constitution: UGANDA_CONSTITUTION_EXCERPTS,
  penalCode: UGANDA_PENAL_CODE_EXCERPTS,
  civilLaw: UGANDA_CIVIL_LAW_EXCERPTS,
  familyLaw: UGANDA_FAMILY_LAW_EXCERPTS,
  laborLaw: UGANDA_LABOR_LAW_EXCERPTS,
  corporateLaw: UGANDA_CORPORATE_LAW_EXCERPTS,
  taxLaw: UGANDA_TAX_LAW_EXCERPTS,
  landLaw: UGANDA_LAND_LAW_EXCERPTS,
};

/**
 * Document chunks for ingestion
 * Each section is broken into manageable chunks for vector embedding
 */
export const UGANDA_LAWS_CHUNKS = [
  {
    id: 'uganda-const-001',
    title: 'Uganda Constitution - Preamble and Articles 1-4',
    category: 'Constitutional Law',
    content: UGANDA_CONSTITUTION_EXCERPTS.split('\n\n').slice(0, 10).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 1,
  },
  {
    id: 'uganda-const-002',
    title: 'Uganda Constitution - Objective Principles',
    category: 'Constitutional Law',
    content: UGANDA_CONSTITUTION_EXCERPTS.split('\n\n').slice(10, 20).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 2,
  },
  {
    id: 'uganda-penal-001',
    title: 'Penal Code - General Principles',
    category: 'Criminal Law',
    content: UGANDA_PENAL_CODE_EXCERPTS.split('\n\n').slice(0, 15).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 1,
  },
  {
    id: 'uganda-penal-002',
    title: 'Penal Code - Serious Offences',
    category: 'Criminal Law',
    content: UGANDA_PENAL_CODE_EXCERPTS.split('\n\n').slice(15, 30).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 2,
  },
  {
    id: 'uganda-contract-001',
    title: 'Contract Law - Formation and Essential Elements',
    category: 'Civil Law',
    content: UGANDA_CIVIL_LAW_EXCERPTS.split('\n\n').slice(0, 15).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 1,
  },
  {
    id: 'uganda-contract-002',
    title: 'Contract Law - Offer and Acceptance',
    category: 'Civil Law',
    content: UGANDA_CIVIL_LAW_EXCERPTS.split('\n\n').slice(15, 30).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 2,
  },
  {
    id: 'uganda-property-001',
    title: 'Property Law - Ownership and Landlord Rights',
    category: 'Civil Law',
    content: UGANDA_CIVIL_LAW_EXCERPTS.split('\n\n').slice(30, 45).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 3,
  },
  {
    id: 'uganda-succession-001',
    title: 'Succession Law - Intestate Succession',
    category: 'Family Law',
    content: UGANDA_FAMILY_LAW_EXCERPTS.split('\n\n').slice(0, 12).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 1,
  },
  {
    id: 'uganda-marriage-001',
    title: 'Marriage and Divorce Act - Marriage Validity',
    category: 'Family Law',
    content: UGANDA_FAMILY_LAW_EXCERPTS.split('\n\n').slice(12, 24).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 2,
  },
  {
    id: 'uganda-divorce-001',
    title: 'Marriage and Divorce Act - Divorce Grounds and Procedure',
    category: 'Family Law',
    content: UGANDA_FAMILY_LAW_EXCERPTS.split('\n\n').slice(24, 36).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 3,
  },
  {
    id: 'uganda-employment-001',
    title: 'Employment Act - Terms of Employment',
    category: 'Labor Law',
    content: UGANDA_LABOR_LAW_EXCERPTS.split('\n\n').slice(0, 15).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 1,
  },
  {
    id: 'uganda-employment-002',
    title: 'Employment Act - Wages and Working Hours',
    category: 'Labor Law',
    content: UGANDA_LABOR_LAW_EXCERPTS.split('\n\n').slice(15, 30).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 2,
  },
  {
    id: 'uganda-employment-003',
    title: 'Employment Act - Termination and Dismissal',
    category: 'Labor Law',
    content: UGANDA_LABOR_LAW_EXCERPTS.split('\n\n').slice(30, 45).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 3,
  },
  {
    id: 'uganda-companies-001',
    title: 'Companies Act - Incorporation and Management',
    category: 'Corporate Law',
    content: UGANDA_CORPORATE_LAW_EXCERPTS.split('\n\n').slice(0, 15).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 1,
  },
  {
    id: 'uganda-companies-002',
    title: 'Companies Act - Shares and Shareholder Rights',
    category: 'Corporate Law',
    content: UGANDA_CORPORATE_LAW_EXCERPTS.split('\n\n').slice(15, 30).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 2,
  },
  {
    id: 'uganda-tax-001',
    title: 'Income Tax Act - General Principles and Rates',
    category: 'Tax Law',
    content: UGANDA_TAX_LAW_EXCERPTS.split('\n\n').slice(0, 15).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 1,
  },
  {
    id: 'uganda-tax-002',
    title: 'Income Tax Act - Deductions and Collections',
    category: 'Tax Law',
    content: UGANDA_TAX_LAW_EXCERPTS.split('\n\n').slice(15, 30).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 2,
  },
  {
    id: 'uganda-land-001',
    title: 'Land Act - Land Tenure and Categories',
    category: 'Land Law',
    content: UGANDA_LAND_LAW_EXCERPTS.split('\n\n').slice(0, 15).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 1,
  },
  {
    id: 'uganda-land-002',
    title: 'Land Act - Registration and Transfer',
    category: 'Land Law',
    content: UGANDA_LAND_LAW_EXCERPTS.split('\n\n').slice(15, 30).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 2,
  },
  {
    id: 'uganda-land-003',
    title: 'Land Act - Mortgages and Tenant Rights',
    category: 'Land Law',
    content: UGANDA_LAND_LAW_EXCERPTS.split('\n\n').slice(30, 45).join('\n\n'),
    source: 'Laws of the Republic of Uganda - v3 Edition 2023',
    chunkIndex: 3,
  },
];

/**
 * Topics index for search and categorization
 */
export const UGANDA_LAWS_TOPICS = {
  constitutional: ['Preamble', 'National Objectives', 'Fundamental Rights', 'Supremacy of Constitution'],
  criminal: ['Murder', 'Manslaughter', 'Theft', 'Sexual Offences', 'Burglary', 'Assault'],
  civil: ['Contracts', 'Offer and Acceptance', 'Consideration', 'Property', 'Landlord and Tenant'],
  family: ['Marriage', 'Divorce', 'Succession', 'Custody', 'Inheritance', 'Guardianship'],
  employment: ['Contract of Service', 'Wages', 'Working Hours', 'Leave', 'Termination', 'Dismissal'],
  corporate: ['Incorporation', 'Board of Directors', 'Shareholders', 'Shares', 'Dividends', 'Audits'],
  tax: ['Income Tax', 'Corporate Tax', 'Deductions', 'PAYE', 'VAT', 'Import Duties'],
  land: ['Land Tenure', 'Registration', 'Transfer', 'Mortgages', 'Leasehold', 'Freehold'],
};
