import React, { useState } from 'react';
import { PaystackButton } from 'react-paystack';
import { Icon, Segment, Form, Header } from "semantic-ui-react"
import validator from "validator"
import { functionCaller, analytics } from "../fbase"
import { getSubAmmount, getSubCostPerUser } from "../../utils/resources";
import ErrorBoundary from "./ErrorBoundary"

function SubscriptionForm({ workspace, subscription, addMessage }) {
    let cost = subscription? getSubAmmount(workspace.subscription.quantity || 1) : 5000;
    const [email, setEmail] = useState(workspace.subscription.email || "");
    const [loading, setLoading] = useState(false);

    let isPartner = false
    if ((workspace.subscription.payment_count <= 4) && !!workspace.affiliateId && !!workspace.subscription.subaccount_code) {
        isPartner = true;
    }

    // console.log("email: ", workspace.subscription.email);

    const callback = (response) => {
        // console.log("transactionRef: ",response.reference); // card charged successfully, get reference here
        setLoading(true);
        if (subscription) {
            functionCaller('verify_transaction', {  
                reference: response.reference, 
                workspace: workspace,
            })
            .then((res) => {
                // console.log(res);
                if (workspace.subscription.payment_count === 0) {
                    analytics.logEvent("add_workspace_subscription", {
                        affiliate: isPartner,
                        quantity: workspace.subscription.quantity,
                        cost: cost/100
                    })
                } else {
                    analytics.logEvent("update_workspace_subscription", {
                        affiliate: isPartner,
                        quantity: workspace.subscription.quantity,
                        cost: cost/100
                    })
                }
                setLoading(false);
                addMessage('Subscription successfully activated')
            })
            .catch((err) => {
                // console.log(err);
                setLoading(false);
                addMessage(err.message || 'Problem activating your subscription')
            })
        } else {
            
            functionCaller('update_payment', {  
                reference: response.reference, 
                workspace: workspace
            })
            .then((res) => {
                // console.log(res);
                analytics.logEvent("update_payment_info")
                setLoading(false);
                addMessage('Payment information successfully updated')
            })
            .catch((err) => {
                // console.log(err.message);
                setLoading(false);
                addMessage(err.message || 'Problem updatting your payment information')
            })
        }
    }


  return (
    <Segment loading={loading} inverted>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
            <Icon size='large' name="cc mastercard"/> <Icon size='large' name="cc visa"/> <span style={{ fontSize: 18}}>VERVE</span>
        </div>
        <Form>
            <Form.Input icon="at" iconPosition="left" type="email" value={email} placeholder="Company or worksapce email" onChange={(e, { value}) => setEmail(value)} />
        </Form>
        <br />
        {(subscription) && (
        <div>
            Your subscription will start after making the payment.
            <br />
            Subscription Price → <span>{workspace.subscription.quantity || 1} Team Member(s) x {getSubCostPerUser(workspace.subscription.quantity || 1)}/ Team Member(s) = {cost/100} NGN</span>
        </div>)}
        {(!subscription) && (
        <div>
            The {cost/100} NGN payment will be refunded.
            <br />
            The payment be used to validate your ATM card
        </div>)}
        {(validator.isEmail(email)) && (
        <ErrorBoundary>
            <PaystackButton
                text={subscription? `Pay ${cost/100} NGN` : `Make ${cost/100} NGN Payment`}
                className="ui grey fluid button"
                onSuccess={callback}
                disabled={true}
                embed={true}
                email={email}
                amount={cost}
                channels={['card']}
                publicKey={process.env.REACT_APP_PAYSTACK_PUBLIC_KEY}
                currency={"NGN"}
                tag="button"
                subaccount={(isPartner && subscription)? workspace.subscription.subaccount_code : ""}
                metadata= {{
                    custom_fields: [
                        {
                            "display_name":"Workspace ID",
                            "variable_name":"workspaceId",
                            "value": workspace.id
                        }, 
                        {
                            "display_name":"Workspace Name",
                            "variable_name":"workspaceName",
                            "value": workspace.name
                        },
                        {
                            "display_name":"Reason",
                            "variable_name":"reason",
                            "value": subscription? "workspace subscription" : "update card information"
                        },
                    ]
                }}
            />
        </ErrorBoundary>)}

        {(!validator.isEmail(email)) && (
            <Header>
                Enter a valid email address to initialize payment
            </Header>
        )}
        <Icon name="info" color="green" /> {subscription? 
        "The card information you provide will be used for this workspace monthly subscription." 
        : 
        "Your card will be charged 50 Naira now and refunded. The card will be charged for subsequent monthly subscriptions."}
    </Segment>
  );
}

export default SubscriptionForm;