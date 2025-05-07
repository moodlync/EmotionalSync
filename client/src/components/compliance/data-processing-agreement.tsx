import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DataProcessingAgreementProps {
  companyName: string;
  processorName?: string;
  lastUpdated: string;
}

export const DataProcessingAgreement: React.FC<DataProcessingAgreementProps> = ({ 
  companyName = 'MoodSync',
  processorName = '[DATA PROCESSOR NAME]',
  lastUpdated = new Date().toLocaleDateString()
}) => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Data Processing Agreement</CardTitle>
        <CardDescription>Between {companyName} and {processorName}</CardDescription>
        <CardDescription>Last Updated: {lastUpdated}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="parties">
            <AccordionTrigger className="text-lg font-semibold">Parties to this Agreement</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Data Controller</h4>
                <p>{companyName}, a company registered at [ADDRESS], hereinafter referred to as "Controller".</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Data Processor</h4>
                <p>{processorName}, a company registered at [ADDRESS], hereinafter referred to as "Processor".</p>
              </div>
              
              <p className="mt-4">
                Each a "Party" and together the "Parties".
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="background">
            <AccordionTrigger className="text-lg font-semibold">Background and Purpose</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                The Controller has engaged the Processor to provide [DESCRIPTION OF SERVICES] (the "Services"). 
                In providing the Services, the Processor will Process Personal Data on behalf of the Controller.
              </p>
              
              <p>
                This Data Processing Agreement ("DPA") sets out the terms and conditions under which the Processor 
                shall process Personal Data on behalf of the Controller. This DPA is designed to ensure compliance 
                with applicable data protection laws, including but not limited to the General Data Protection 
                Regulation (EU) 2016/679 ("GDPR") and the California Consumer Privacy Act ("CCPA").
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="definitions">
            <AccordionTrigger className="text-lg font-semibold">Definitions</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>In this DPA, the following terms shall have the meanings set out below:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>
                  <strong>"Personal Data"</strong> means any information relating to an identified or identifiable 
                  natural person ('Data Subject'). An identifiable person is one who can be identified, directly 
                  or indirectly, in particular by reference to an identifier such as a name, an identification 
                  number, location data, an online identifier or to one or more factors specific to the physical, 
                  physiological, genetic, mental, economic, cultural or social identity of that natural person.
                </li>
                <li>
                  <strong>"Processing"</strong> means any operation or set of operations which is performed on 
                  Personal Data or on sets of Personal Data, whether or not by automated means, such as collection, 
                  recording, organization, structuring, storage, adaptation or alteration, retrieval, consultation, 
                  use, disclosure by transmission, dissemination or otherwise making available, alignment or 
                  combination, restriction, erasure or destruction.
                </li>
                <li>
                  <strong>"Data Subject"</strong> means an identified or identifiable natural person to whom the 
                  Personal Data relates.
                </li>
                <li>
                  <strong>"Data Protection Laws"</strong> means all laws and regulations applicable to the Processing 
                  of Personal Data under this DPA, including but not limited to the GDPR and the CCPA.
                </li>
                <li>
                  <strong>"Personal Data Breach"</strong> means a breach of security leading to the accidental or 
                  unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, Personal Data 
                  transmitted, stored or otherwise Processed.
                </li>
                <li>
                  <strong>"Services"</strong> means the services to be provided by the Processor to the Controller 
                  as described in the underlying service agreement between the Parties.
                </li>
                <li>
                  <strong>"Sub-processor"</strong> means any Processor engaged by the Processor who agrees to 
                  receive from the Processor Personal Data exclusively intended for Processing activities to be 
                  carried out on behalf of the Controller.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="processing-details">
            <AccordionTrigger className="text-lg font-semibold">Details of Processing</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Types of Personal Data</h4>
                <p>The Processor shall Process the following categories of Personal Data:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>User account data (name, email address, username)</li>
                  <li>Usage data (IP address, device information, browser information)</li>
                  <li>Emotional data (mood logs, journal entries)</li>
                  <li>[OTHER CATEGORIES OF PERSONAL DATA]</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Categories of Data Subjects</h4>
                <p>The Personal Data Processed concern the following categories of Data Subjects:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Users of the Controller's services</li>
                  <li>Employees of the Controller</li>
                  <li>[OTHER CATEGORIES OF DATA SUBJECTS]</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Processing Operations</h4>
                <p>The Processor shall Process the Personal Data for the following purposes:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Provision of the Services as described in the underlying service agreement</li>
                  <li>Storage and hosting of User data</li>
                  <li>Technical support and maintenance</li>
                  <li>[OTHER PROCESSING OPERATIONS]</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Duration of Processing</h4>
                <p>The Processor shall Process the Personal Data for the duration of the underlying service agreement, subject to Section 9 (Return or Deletion of Personal Data) of this DPA.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="processor-obligations">
            <AccordionTrigger className="text-lg font-semibold">Processor Obligations</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>The Processor shall:</p>
              <ol className="list-decimal pl-6 mt-2 space-y-4">
                <li>
                  Process the Personal Data only on documented instructions from the Controller, including with 
                  regard to transfers of Personal Data to a third country or an international organization, unless 
                  required to do so by applicable law; in such a case, the Processor shall inform the Controller 
                  of that legal requirement before Processing, unless that law prohibits such information on 
                  important grounds of public interest.
                </li>
                <li>
                  Ensure that persons authorized to Process the Personal Data have committed themselves to 
                  confidentiality or are under an appropriate statutory obligation of confidentiality.
                </li>
                <li>
                  Implement appropriate technical and organizational measures to ensure a level of security 
                  appropriate to the risk, including:
                  <ul className="list-disc pl-6 mt-1">
                    <li>The pseudonymization and encryption of Personal Data;</li>
                    <li>The ability to ensure ongoing confidentiality, integrity, availability and resilience of processing systems and services;</li>
                    <li>The ability to restore the availability and access to Personal Data in a timely manner in the event of a physical or technical incident;</li>
                    <li>A process for regularly testing, assessing and evaluating the effectiveness of technical and organizational measures for ensuring the security of the Processing.</li>
                  </ul>
                </li>
                <li>
                  Respect the conditions for engaging another Processor (a "Sub-processor") as set out in Section 6 
                  of this DPA.
                </li>
                <li>
                  Taking into account the nature of the Processing, assist the Controller by appropriate technical 
                  and organizational measures, insofar as this is possible, for the fulfillment of the Controller's 
                  obligation to respond to requests for exercising the Data Subject's rights under the Data Protection Laws.
                </li>
                <li>
                  Assist the Controller in ensuring compliance with the obligations regarding security of Processing, 
                  notification of Personal Data Breaches, data protection impact assessments, and prior consultations 
                  with supervisory authorities, taking into account the nature of Processing and the information 
                  available to the Processor.
                </li>
                <li>
                  At the choice of the Controller, delete or return all the Personal Data to the Controller after 
                  the end of the provision of Services relating to Processing, and delete existing copies unless 
                  applicable law requires storage of the Personal Data.
                </li>
                <li>
                  Make available to the Controller all information necessary to demonstrate compliance with the 
                  obligations laid down in this DPA and allow for and contribute to audits, including inspections, 
                  conducted by the Controller or another auditor mandated by the Controller.
                </li>
                <li>
                  Immediately inform the Controller if, in its opinion, an instruction infringes the Data Protection 
                  Laws or other data protection provisions of applicable law.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="controller-obligations">
            <AccordionTrigger className="text-lg font-semibold">Controller Obligations</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>The Controller shall:</p>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>
                  Ensure that its instructions to the Processor regarding the Processing of Personal Data comply 
                  with applicable Data Protection Laws.
                </li>
                <li>
                  Have sole responsibility for the accuracy, quality, and legality of Personal Data and the means 
                  by which it acquired the Personal Data.
                </li>
                <li>
                  Establish the legal basis for Processing under Data Protection Laws before instructing the 
                  Processor to Process Personal Data.
                </li>
                <li>
                  Respond to inquiries from Data Subjects and supervisory authorities concerning the Processing 
                  of Personal Data by the Processor.
                </li>
                <li>
                  Notify the Processor without undue delay about any limitation or problems with respect to the 
                  Controller's instructions, if the Controller becomes aware of such limitations or problems.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="sub-processors">
            <AccordionTrigger className="text-lg font-semibold">Sub-processors</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                The Controller provides general authorization for the Processor to engage Sub-processors 
                for the Processing of Personal Data, subject to the following conditions:
              </p>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>
                  The Processor shall inform the Controller of any intended changes concerning the addition or 
                  replacement of Sub-processors, thereby giving the Controller the opportunity to object to such changes.
                </li>
                <li>
                  The Processor shall ensure that the terms of its agreement with each Sub-processor are at least 
                  as protective as the terms of this DPA.
                </li>
                <li>
                  The Processor shall remain fully liable to the Controller for the performance of that Sub-processor's 
                  obligations.
                </li>
                <li>
                  The Processor shall maintain a list of all Sub-processors engaged in the Processing of Personal 
                  Data and make such list available to the Controller upon request.
                </li>
              </ol>
              <p className="mt-4">
                Current Sub-processors engaged by the Processor for the Processing of Personal Data include:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>[SUB-PROCESSOR 1] - [PROCESSING ACTIVITIES]</li>
                <li>[SUB-PROCESSOR 2] - [PROCESSING ACTIVITIES]</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="data-breaches">
            <AccordionTrigger className="text-lg font-semibold">Personal Data Breaches</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                In the event of a Personal Data Breach, the Processor shall:
              </p>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>
                  Notify the Controller without undue delay after becoming aware of a Personal Data Breach, and 
                  in any event within 24 hours.
                </li>
                <li>
                  Provide the Controller with sufficient information to allow the Controller to meet any 
                  obligations to report or inform Data Subjects or supervisory authorities of the Personal 
                  Data Breach under the Data Protection Laws.
                </li>
                <li>
                  At a minimum, include in the notification to the Controller:
                  <ul className="list-disc pl-6 mt-1">
                    <li>A description of the nature of the Personal Data Breach including, where possible, the categories and approximate number of Data Subjects concerned and the categories and approximate number of Personal Data records concerned;</li>
                    <li>The name and contact details of the Processor's data protection officer or other contact point where more information can be obtained;</li>
                    <li>A description of the likely consequences of the Personal Data Breach;</li>
                    <li>A description of the measures taken or proposed to be taken to address the Personal Data Breach, including, where appropriate, measures to mitigate its possible adverse effects.</li>
                  </ul>
                </li>
                <li>
                  Cooperate with the Controller and take such reasonable commercial steps as are directed by 
                  the Controller to assist in the investigation, mitigation and remediation of each such 
                  Personal Data Breach.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="audit-rights">
            <AccordionTrigger className="text-lg font-semibold">Audit Rights</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                The Processor shall make available to the Controller all information necessary to demonstrate 
                compliance with the obligations laid down in this DPA and allow for and contribute to audits, 
                including inspections, conducted by the Controller or another auditor mandated by the Controller.
              </p>
              <p className="mt-2">
                The Processor shall immediately inform the Controller if, in its opinion, an instruction 
                infringes the Data Protection Laws or other data protection provisions of applicable law.
              </p>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>
                  The Controller may audit the Processor's compliance with this DPA up to once per year, unless 
                  an audit is required by a supervisory authority or the Controller has reasonable grounds to 
                  suspect a breach of this DPA.
                </li>
                <li>
                  The Controller shall give the Processor reasonable notice of any audit or inspection to be 
                  conducted and shall make reasonable endeavors to avoid causing any damage, injury or disruption 
                  to the Processor's premises, equipment, personnel and business while its personnel are on those 
                  premises in the course of such an audit or inspection.
                </li>
                <li>
                  The Processor shall contribute to such audits or inspections by providing the Controller or 
                  the mandated auditor with the information and assistance reasonably necessary to conduct the audit.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="return-deletion">
            <AccordionTrigger className="text-lg font-semibold">Return or Deletion of Personal Data</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                Upon termination or expiration of the underlying service agreement, or upon the Controller's 
                reasonable request, the Processor shall, at the choice of the Controller, delete or return to 
                the Controller all Personal Data processed on behalf of the Controller and delete existing copies, 
                unless applicable law requires storage of the Personal Data.
              </p>
              <p className="mt-2">
                If the Controller opts for deletion of the Personal Data, the Processor shall provide written 
                certification of deletion to the Controller within 30 days of the Controller's request.
              </p>
              <p className="mt-2">
                If the Controller opts for the return of the Personal Data, the Processor shall return the 
                Personal Data in a structured, commonly used and machine-readable format.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="liability">
            <AccordionTrigger className="text-lg font-semibold">Liability and Indemnity</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                Each Party shall be liable for and shall indemnify the other Party against all actions, 
                proceedings, costs, claims, damages, liabilities and expenses (including legal costs) 
                incurred by the other Party in respect of any breach of this DPA by the first Party, 
                subject to the limitations of liability set out in the underlying service agreement.
              </p>
              <p className="mt-2">
                The Processor shall be liable for damage caused by Processing only where:
              </p>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>
                  It has not complied with obligations of the Data Protection Laws specifically directed to processors; or
                </li>
                <li>
                  It has acted outside or contrary to lawful instructions of the Controller.
                </li>
              </ol>
              <p className="mt-4">
                The Controller shall be liable for damage caused by Processing which infringes the Data Protection Laws.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="governing-law">
            <AccordionTrigger className="text-lg font-semibold">Governing Law and Jurisdiction</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                This DPA shall be governed by and construed in accordance with the laws of [JURISDICTION], 
                without regard to its conflicts of law rules.
              </p>
              <p className="mt-2">
                The courts of [JURISDICTION] shall have exclusive jurisdiction to settle any dispute or claim 
                arising out of or in connection with this DPA.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="miscellaneous">
            <AccordionTrigger className="text-lg font-semibold">Miscellaneous</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                <strong>Entire Agreement:</strong> This DPA constitutes the entire agreement between the 
                Parties with respect to the Processing of Personal Data and supersedes all prior agreements, 
                understandings, negotiations and discussions, whether oral or written, relating to the 
                Processing of Personal Data.
              </p>
              <p className="mt-2">
                <strong>Severability:</strong> If any provision of this DPA is held to be invalid or 
                unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
              <p className="mt-2">
                <strong>Amendment:</strong> This DPA may not be amended or modified except by a written 
                instrument executed by both Parties.
              </p>
              <p className="mt-2">
                <strong>No Waiver:</strong> A failure or delay by either Party to exercise any right or 
                remedy provided under this DPA or by law shall not constitute a waiver of that or any 
                other right or remedy, nor shall it prevent or restrict any further exercise of that or 
                any other right or remedy.
              </p>
              <p className="mt-2">
                <strong>Assignment:</strong> Neither Party may assign or transfer any of its rights or 
                obligations under this DPA without the prior written consent of the other Party, 
                except that either Party may assign this DPA to a successor in connection with a merger, 
                acquisition, or sale of all or substantially all of its assets.
              </p>
              <p className="mt-2">
                <strong>Counterparts:</strong> This DPA may be executed in counterparts, each of which 
                shall be deemed an original, but all of which together shall constitute one and the 
                same instrument.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default DataProcessingAgreement;