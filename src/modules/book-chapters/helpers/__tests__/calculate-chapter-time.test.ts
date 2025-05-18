import * as R from 'ramda'

const chapter = {
  subchapters: [
    {
      contents: [
        {
          content_html: `Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. 
    
In chemical reactions, all negative charges are due to electrons, and all positive charges are due to protons. Electrons are attracted to protons and repelled by other electrons.`,
        },
        {
          content_html: `The dash formula shows the bonds between each atom on a two-dimensional plane without showing the three-dimensional structure. Lone pairs of electrons may be added as dots. Lewis structures are often drawn using the dash formula.

The condensed formula does not show bonds. Central atoms are usually followed by the atoms that bond to them even when this is not the bonding order. For instance, the three hydrogens following the carbon in CH3NH2 bond to carbon, not to nitrogen.`,
        },
        {
          content_html: `In the bond-line formula, line intersections, corners, and endings represent a carbon atom unless a heteroatom is drawn in. Hydrogen atoms sufficient to complete each carbon’s octet (or satisfy any formal charges) are not usually drawn but are assumed to be present. 

The bond-line structure emphasizes functional groups by deemphasizing less reactive portions of a molecule. The bond-line formula is especially useful when viewing more complicated structures.`,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Movement of a pair of electrons in organic chemistry is shown by a double pronged arrow. When the arrow has only one prong, it is representing the movement of only one electron. The arrow always points from where the electrons start to where they end up.',
        },
        {
          content_html: `The Newman projection is used to compare the same molecule in various conformations. It provides a view down the axis of a single bond and shows the orientation of atoms rotated about the bond. 

The wedge and dash projection represents three-dimensions on a two dimensional page. In the wedge and dash projection the black wedge is assumed to be coming out of the page, the dashed wedge is assumed to be going into the page, and the lines are assumed to be in the plane of the page.`,
        },
        {
          content_html: `The index of hydrogen deficiency (IHD) or degree of unsaturation (DoU) indicates the number of rings and π bonds in a compound. If you have the structure drawn in front of you, the IHD is not too useful. You can find the IHD, simply by counting the rings and π bonds in the structure. However, the IHD is usually used to help you discover a structure when you can’t see the structure and you only know the molecular formula.

The reason for IHD is to figure out the structure. If you can already know the structure, just count the rings and п bonds.

Since saturating a structure requires the addition of two hydrogens for each π bond or ring, the IHD for any hydrocarbon (a molecule containing only carbons and hydrogens) is half the difference between the number of hydrogens on the compound and the number of hydrogens on a corresponding straight-chain alkane. This gives the formula below. `,
        },
        {
          content_html: `A functional group is an arrangement of specific atoms attached to a larger molecule. It has a unique set of predictable chemical behaviors. 

The behavior of one functional group may be modified by other functional groups attached to the same molecule. 

To a large extent, chemical behavior of a molecule can be predicted based upon its functional groups. When presented with an unfamiliar molecule, you should consider the behavior of its functional groups.`,
        },
        {
          content_html: `A family is the category into which structures possessing a specific functional group are placed. For instance, structures with an alkyl group belong in the family of alkanes. Structures with a carboxyl group belong in the family of carboxylic acids. The functional group is the structure attached to the molecule; the family is the category that the molecule falls into because it possesses the functional group.

It is easy to confuse a molecular family with a functional group. Some functional groups are commonly referred to by their family name. Alcohol is a common example of a family that is often incorrectly used to indicate the hydroxy functional group. 

There are many functional groups. The most common groups are listed in the table in the upper righthand corner of your screen.

A carbon bonded to any functional group is said to be an α-carbon (alpha carbon). Moving away from the functional group, a carbon bonded to an α-carbon is said to be a β-carbon (beta carbon). This nomenclature continues down the Greek alphabet (e.g. α, β, γ, δ, ε, and so on). The carbon at the end of the line, regardless of the position number, is sometimes called the ω-carbon (omega carbon). A hydrogen attached to an α-carbon is an α-hydrogen. One attached to a β-carbon is a β-hydrogen, and so on. `,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Nucleophile means nucleus-loving. A nucleus is a group of positively charged protons. A nucleophile is a species with a concentration of negative charge looking for a concentration of positive charge to form a bond. The atom or functional group with the concentration of positive charge is called an electrophile. Nucleophiles attack electrophiles.',
        },
        {
          content_html: `On the MCAT, you may come across large, unfamiliar molecules. You will not be expected to recognize the large molecule or know its chemistry, but you will be expected to recognize its functional groups and estimate how they might behave. You should assume the functional group will exhibit the typical behavior of its functional group. 

First learn the names of the functional groups. As you study the reactions familiarize yourself with the “personality” of each group. How does it behave? Where do its electrons like to be and like to go? Is it hungry for positive or negative charge? How stable is it as a leaving group? Focus on the behavior of the functional group. You will begin to gain an intuition of organic chemistry that will allow you to make predictions about the outcome of unfamiliar reactions.`,
        },
        {
          content_html: `Unfortunately, there is often more than one name for a single organic compound. There is often at least one common name, and there is always a systematic IUPAC (International Union of Pure and Applied Chemistry) name. For many compounds, you will need to know both names.

The IUPAC rules for the systematic naming of organic compounds are quite complicated, spanning hundreds of pages. For the MCAT, you will need to know the following IUPAC rules. 

Hydrocarbons are compounds composed only of carbon and hydrogen. They include three families: alkane (only single bonds), alkene (one or more double bonds), and alkyne (one or more triple bonds). The names of alkanes, alkenes, and alkynes end with -ane, -ene, and -yne, respectively.`,
        },
      ],
    },
    {
      contents: [
        {
          content_html: `Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. 
    
In chemical reactions, all negative charges are due to electrons, and all positive charges are due to protons. Electrons are attracted to protons and repelled by other electrons.`,
        },
        {
          content_html: `The dash formula shows the bonds between each atom on a two-dimensional plane without showing the three-dimensional structure. Lone pairs of electrons may be added as dots. Lewis structures are often drawn using the dash formula.

The condensed formula does not show bonds. Central atoms are usually followed by the atoms that bond to them even when this is not the bonding order. For instance, the three hydrogens following the carbon in CH3NH2 bond to carbon, not to nitrogen.`,
        },
        {
          content_html: `In the bond-line formula, line intersections, corners, and endings represent a carbon atom unless a heteroatom is drawn in. Hydrogen atoms sufficient to complete each carbon’s octet (or satisfy any formal charges) are not usually drawn but are assumed to be present. 

The bond-line structure emphasizes functional groups by deemphasizing less reactive portions of a molecule. The bond-line formula is especially useful when viewing more complicated structures.`,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Movement of a pair of electrons in organic chemistry is shown by a double pronged arrow. When the arrow has only one prong, it is representing the movement of only one electron. The arrow always points from where the electrons start to where they end up.',
        },
        {
          content_html: `The Newman projection is used to compare the same molecule in various conformations. It provides a view down the axis of a single bond and shows the orientation of atoms rotated about the bond. 

The wedge and dash projection represents three-dimensions on a two dimensional page. In the wedge and dash projection the black wedge is assumed to be coming out of the page, the dashed wedge is assumed to be going into the page, and the lines are assumed to be in the plane of the page.`,
        },
        {
          content_html: `The index of hydrogen deficiency (IHD) or degree of unsaturation (DoU) indicates the number of rings and π bonds in a compound. If you have the structure drawn in front of you, the IHD is not too useful. You can find the IHD, simply by counting the rings and π bonds in the structure. However, the IHD is usually used to help you discover a structure when you can’t see the structure and you only know the molecular formula.

The reason for IHD is to figure out the structure. If you can already know the structure, just count the rings and п bonds.

Since saturating a structure requires the addition of two hydrogens for each π bond or ring, the IHD for any hydrocarbon (a molecule containing only carbons and hydrogens) is half the difference between the number of hydrogens on the compound and the number of hydrogens on a corresponding straight-chain alkane. This gives the formula below. `,
        },
        {
          content_html: `A functional group is an arrangement of specific atoms attached to a larger molecule. It has a unique set of predictable chemical behaviors. 

The behavior of one functional group may be modified by other functional groups attached to the same molecule. 

To a large extent, chemical behavior of a molecule can be predicted based upon its functional groups. When presented with an unfamiliar molecule, you should consider the behavior of its functional groups.`,
        },
        {
          content_html: `A family is the category into which structures possessing a specific functional group are placed. For instance, structures with an alkyl group belong in the family of alkanes. Structures with a carboxyl group belong in the family of carboxylic acids. The functional group is the structure attached to the molecule; the family is the category that the molecule falls into because it possesses the functional group.

It is easy to confuse a molecular family with a functional group. Some functional groups are commonly referred to by their family name. Alcohol is a common example of a family that is often incorrectly used to indicate the hydroxy functional group. 

There are many functional groups. The most common groups are listed in the table in the upper righthand corner of your screen.

A carbon bonded to any functional group is said to be an α-carbon (alpha carbon). Moving away from the functional group, a carbon bonded to an α-carbon is said to be a β-carbon (beta carbon). This nomenclature continues down the Greek alphabet (e.g. α, β, γ, δ, ε, and so on). The carbon at the end of the line, regardless of the position number, is sometimes called the ω-carbon (omega carbon). A hydrogen attached to an α-carbon is an α-hydrogen. One attached to a β-carbon is a β-hydrogen, and so on. `,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Nucleophile means nucleus-loving. A nucleus is a group of positively charged protons. A nucleophile is a species with a concentration of negative charge looking for a concentration of positive charge to form a bond. The atom or functional group with the concentration of positive charge is called an electrophile. Nucleophiles attack electrophiles.',
        },
        {
          content_html: `On the MCAT, you may come across large, unfamiliar molecules. You will not be expected to recognize the large molecule or know its chemistry, but you will be expected to recognize its functional groups and estimate how they might behave. You should assume the functional group will exhibit the typical behavior of its functional group. 

First learn the names of the functional groups. As you study the reactions familiarize yourself with the “personality” of each group. How does it behave? Where do its electrons like to be and like to go? Is it hungry for positive or negative charge? How stable is it as a leaving group? Focus on the behavior of the functional group. You will begin to gain an intuition of organic chemistry that will allow you to make predictions about the outcome of unfamiliar reactions.`,
        },
        {
          content_html: `Unfortunately, there is often more than one name for a single organic compound. There is often at least one common name, and there is always a systematic IUPAC (International Union of Pure and Applied Chemistry) name. For many compounds, you will need to know both names.

The IUPAC rules for the systematic naming of organic compounds are quite complicated, spanning hundreds of pages. For the MCAT, you will need to know the following IUPAC rules. 

Hydrocarbons are compounds composed only of carbon and hydrogen. They include three families: alkane (only single bonds), alkene (one or more double bonds), and alkyne (one or more triple bonds). The names of alkanes, alkenes, and alkynes end with -ane, -ene, and -yne, respectively.`,
        },
      ],
    },
    {
      contents: [
        {
          content_html: `Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. 
    
In chemical reactions, all negative charges are due to electrons, and all positive charges are due to protons. Electrons are attracted to protons and repelled by other electrons.`,
        },
        {
          content_html: `The dash formula shows the bonds between each atom on a two-dimensional plane without showing the three-dimensional structure. Lone pairs of electrons may be added as dots. Lewis structures are often drawn using the dash formula.

The condensed formula does not show bonds. Central atoms are usually followed by the atoms that bond to them even when this is not the bonding order. For instance, the three hydrogens following the carbon in CH3NH2 bond to carbon, not to nitrogen.`,
        },
        {
          content_html: `In the bond-line formula, line intersections, corners, and endings represent a carbon atom unless a heteroatom is drawn in. Hydrogen atoms sufficient to complete each carbon’s octet (or satisfy any formal charges) are not usually drawn but are assumed to be present. 

The bond-line structure emphasizes functional groups by deemphasizing less reactive portions of a molecule. The bond-line formula is especially useful when viewing more complicated structures.`,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Movement of a pair of electrons in organic chemistry is shown by a double pronged arrow. When the arrow has only one prong, it is representing the movement of only one electron. The arrow always points from where the electrons start to where they end up.',
        },
        {
          content_html: `The Newman projection is used to compare the same molecule in various conformations. It provides a view down the axis of a single bond and shows the orientation of atoms rotated about the bond. 

The wedge and dash projection represents three-dimensions on a two dimensional page. In the wedge and dash projection the black wedge is assumed to be coming out of the page, the dashed wedge is assumed to be going into the page, and the lines are assumed to be in the plane of the page.`,
        },
        {
          content_html: `The index of hydrogen deficiency (IHD) or degree of unsaturation (DoU) indicates the number of rings and π bonds in a compound. If you have the structure drawn in front of you, the IHD is not too useful. You can find the IHD, simply by counting the rings and π bonds in the structure. However, the IHD is usually used to help you discover a structure when you can’t see the structure and you only know the molecular formula.

The reason for IHD is to figure out the structure. If you can already know the structure, just count the rings and п bonds.

Since saturating a structure requires the addition of two hydrogens for each π bond or ring, the IHD for any hydrocarbon (a molecule containing only carbons and hydrogens) is half the difference between the number of hydrogens on the compound and the number of hydrogens on a corresponding straight-chain alkane. This gives the formula below. `,
        },
        {
          content_html: `A functional group is an arrangement of specific atoms attached to a larger molecule. It has a unique set of predictable chemical behaviors. 

The behavior of one functional group may be modified by other functional groups attached to the same molecule. 

To a large extent, chemical behavior of a molecule can be predicted based upon its functional groups. When presented with an unfamiliar molecule, you should consider the behavior of its functional groups.`,
        },
        {
          content_html: `A family is the category into which structures possessing a specific functional group are placed. For instance, structures with an alkyl group belong in the family of alkanes. Structures with a carboxyl group belong in the family of carboxylic acids. The functional group is the structure attached to the molecule; the family is the category that the molecule falls into because it possesses the functional group.

It is easy to confuse a molecular family with a functional group. Some functional groups are commonly referred to by their family name. Alcohol is a common example of a family that is often incorrectly used to indicate the hydroxy functional group. 

There are many functional groups. The most common groups are listed in the table in the upper righthand corner of your screen.

A carbon bonded to any functional group is said to be an α-carbon (alpha carbon). Moving away from the functional group, a carbon bonded to an α-carbon is said to be a β-carbon (beta carbon). This nomenclature continues down the Greek alphabet (e.g. α, β, γ, δ, ε, and so on). The carbon at the end of the line, regardless of the position number, is sometimes called the ω-carbon (omega carbon). A hydrogen attached to an α-carbon is an α-hydrogen. One attached to a β-carbon is a β-hydrogen, and so on. `,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Nucleophile means nucleus-loving. A nucleus is a group of positively charged protons. A nucleophile is a species with a concentration of negative charge looking for a concentration of positive charge to form a bond. The atom or functional group with the concentration of positive charge is called an electrophile. Nucleophiles attack electrophiles.',
        },
        {
          content_html: `On the MCAT, you may come across large, unfamiliar molecules. You will not be expected to recognize the large molecule or know its chemistry, but you will be expected to recognize its functional groups and estimate how they might behave. You should assume the functional group will exhibit the typical behavior of its functional group. 

First learn the names of the functional groups. As you study the reactions familiarize yourself with the “personality” of each group. How does it behave? Where do its electrons like to be and like to go? Is it hungry for positive or negative charge? How stable is it as a leaving group? Focus on the behavior of the functional group. You will begin to gain an intuition of organic chemistry that will allow you to make predictions about the outcome of unfamiliar reactions.`,
        },
        {
          content_html: `Unfortunately, there is often more than one name for a single organic compound. There is often at least one common name, and there is always a systematic IUPAC (International Union of Pure and Applied Chemistry) name. For many compounds, you will need to know both names.

The IUPAC rules for the systematic naming of organic compounds are quite complicated, spanning hundreds of pages. For the MCAT, you will need to know the following IUPAC rules. 

Hydrocarbons are compounds composed only of carbon and hydrogen. They include three families: alkane (only single bonds), alkene (one or more double bonds), and alkyne (one or more triple bonds). The names of alkanes, alkenes, and alkynes end with -ane, -ene, and -yne, respectively.`,
        },
      ],
    },
    {
      contents: [
        {
          content_html: `Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. 
    
In chemical reactions, all negative charges are due to electrons, and all positive charges are due to protons. Electrons are attracted to protons and repelled by other electrons.`,
        },
        {
          content_html: `The dash formula shows the bonds between each atom on a two-dimensional plane without showing the three-dimensional structure. Lone pairs of electrons may be added as dots. Lewis structures are often drawn using the dash formula.

The condensed formula does not show bonds. Central atoms are usually followed by the atoms that bond to them even when this is not the bonding order. For instance, the three hydrogens following the carbon in CH3NH2 bond to carbon, not to nitrogen.`,
        },
        {
          content_html: `In the bond-line formula, line intersections, corners, and endings represent a carbon atom unless a heteroatom is drawn in. Hydrogen atoms sufficient to complete each carbon’s octet (or satisfy any formal charges) are not usually drawn but are assumed to be present. 

The bond-line structure emphasizes functional groups by deemphasizing less reactive portions of a molecule. The bond-line formula is especially useful when viewing more complicated structures.`,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Movement of a pair of electrons in organic chemistry is shown by a double pronged arrow. When the arrow has only one prong, it is representing the movement of only one electron. The arrow always points from where the electrons start to where they end up.',
        },
        {
          content_html: `The Newman projection is used to compare the same molecule in various conformations. It provides a view down the axis of a single bond and shows the orientation of atoms rotated about the bond. 

The wedge and dash projection represents three-dimensions on a two dimensional page. In the wedge and dash projection the black wedge is assumed to be coming out of the page, the dashed wedge is assumed to be going into the page, and the lines are assumed to be in the plane of the page.`,
        },
        {
          content_html: `The index of hydrogen deficiency (IHD) or degree of unsaturation (DoU) indicates the number of rings and π bonds in a compound. If you have the structure drawn in front of you, the IHD is not too useful. You can find the IHD, simply by counting the rings and π bonds in the structure. However, the IHD is usually used to help you discover a structure when you can’t see the structure and you only know the molecular formula.

The reason for IHD is to figure out the structure. If you can already know the structure, just count the rings and п bonds.

Since saturating a structure requires the addition of two hydrogens for each π bond or ring, the IHD for any hydrocarbon (a molecule containing only carbons and hydrogens) is half the difference between the number of hydrogens on the compound and the number of hydrogens on a corresponding straight-chain alkane. This gives the formula below. `,
        },
        {
          content_html: `A functional group is an arrangement of specific atoms attached to a larger molecule. It has a unique set of predictable chemical behaviors. 

The behavior of one functional group may be modified by other functional groups attached to the same molecule. 

To a large extent, chemical behavior of a molecule can be predicted based upon its functional groups. When presented with an unfamiliar molecule, you should consider the behavior of its functional groups.`,
        },
        {
          content_html: `A family is the category into which structures possessing a specific functional group are placed. For instance, structures with an alkyl group belong in the family of alkanes. Structures with a carboxyl group belong in the family of carboxylic acids. The functional group is the structure attached to the molecule; the family is the category that the molecule falls into because it possesses the functional group.

It is easy to confuse a molecular family with a functional group. Some functional groups are commonly referred to by their family name. Alcohol is a common example of a family that is often incorrectly used to indicate the hydroxy functional group. 

There are many functional groups. The most common groups are listed in the table in the upper righthand corner of your screen.

A carbon bonded to any functional group is said to be an α-carbon (alpha carbon). Moving away from the functional group, a carbon bonded to an α-carbon is said to be a β-carbon (beta carbon). This nomenclature continues down the Greek alphabet (e.g. α, β, γ, δ, ε, and so on). The carbon at the end of the line, regardless of the position number, is sometimes called the ω-carbon (omega carbon). A hydrogen attached to an α-carbon is an α-hydrogen. One attached to a β-carbon is a β-hydrogen, and so on. `,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Nucleophile means nucleus-loving. A nucleus is a group of positively charged protons. A nucleophile is a species with a concentration of negative charge looking for a concentration of positive charge to form a bond. The atom or functional group with the concentration of positive charge is called an electrophile. Nucleophiles attack electrophiles.',
        },
        {
          content_html: `On the MCAT, you may come across large, unfamiliar molecules. You will not be expected to recognize the large molecule or know its chemistry, but you will be expected to recognize its functional groups and estimate how they might behave. You should assume the functional group will exhibit the typical behavior of its functional group. 

First learn the names of the functional groups. As you study the reactions familiarize yourself with the “personality” of each group. How does it behave? Where do its electrons like to be and like to go? Is it hungry for positive or negative charge? How stable is it as a leaving group? Focus on the behavior of the functional group. You will begin to gain an intuition of organic chemistry that will allow you to make predictions about the outcome of unfamiliar reactions.`,
        },
        {
          content_html: `Unfortunately, there is often more than one name for a single organic compound. There is often at least one common name, and there is always a systematic IUPAC (International Union of Pure and Applied Chemistry) name. For many compounds, you will need to know both names.

The IUPAC rules for the systematic naming of organic compounds are quite complicated, spanning hundreds of pages. For the MCAT, you will need to know the following IUPAC rules. 

Hydrocarbons are compounds composed only of carbon and hydrogen. They include three families: alkane (only single bonds), alkene (one or more double bonds), and alkyne (one or more triple bonds). The names of alkanes, alkenes, and alkynes end with -ane, -ene, and -yne, respectively.`,
        },
      ],
    },
    {
      contents: [
        {
          content_html: `Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. 
    
In chemical reactions, all negative charges are due to electrons, and all positive charges are due to protons. Electrons are attracted to protons and repelled by other electrons.`,
        },
        {
          content_html: `The dash formula shows the bonds between each atom on a two-dimensional plane without showing the three-dimensional structure. Lone pairs of electrons may be added as dots. Lewis structures are often drawn using the dash formula.

The condensed formula does not show bonds. Central atoms are usually followed by the atoms that bond to them even when this is not the bonding order. For instance, the three hydrogens following the carbon in CH3NH2 bond to carbon, not to nitrogen.`,
        },
        {
          content_html: `In the bond-line formula, line intersections, corners, and endings represent a carbon atom unless a heteroatom is drawn in. Hydrogen atoms sufficient to complete each carbon’s octet (or satisfy any formal charges) are not usually drawn but are assumed to be present. 

The bond-line structure emphasizes functional groups by deemphasizing less reactive portions of a molecule. The bond-line formula is especially useful when viewing more complicated structures.`,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Movement of a pair of electrons in organic chemistry is shown by a double pronged arrow. When the arrow has only one prong, it is representing the movement of only one electron. The arrow always points from where the electrons start to where they end up.',
        },
        {
          content_html: `The Newman projection is used to compare the same molecule in various conformations. It provides a view down the axis of a single bond and shows the orientation of atoms rotated about the bond. 

The wedge and dash projection represents three-dimensions on a two dimensional page. In the wedge and dash projection the black wedge is assumed to be coming out of the page, the dashed wedge is assumed to be going into the page, and the lines are assumed to be in the plane of the page.`,
        },
        {
          content_html: `The index of hydrogen deficiency (IHD) or degree of unsaturation (DoU) indicates the number of rings and π bonds in a compound. If you have the structure drawn in front of you, the IHD is not too useful. You can find the IHD, simply by counting the rings and π bonds in the structure. However, the IHD is usually used to help you discover a structure when you can’t see the structure and you only know the molecular formula.

The reason for IHD is to figure out the structure. If you can already know the structure, just count the rings and п bonds.

Since saturating a structure requires the addition of two hydrogens for each π bond or ring, the IHD for any hydrocarbon (a molecule containing only carbons and hydrogens) is half the difference between the number of hydrogens on the compound and the number of hydrogens on a corresponding straight-chain alkane. This gives the formula below. `,
        },
        {
          content_html: `A functional group is an arrangement of specific atoms attached to a larger molecule. It has a unique set of predictable chemical behaviors. 

The behavior of one functional group may be modified by other functional groups attached to the same molecule. 

To a large extent, chemical behavior of a molecule can be predicted based upon its functional groups. When presented with an unfamiliar molecule, you should consider the behavior of its functional groups.`,
        },
        {
          content_html: `A family is the category into which structures possessing a specific functional group are placed. For instance, structures with an alkyl group belong in the family of alkanes. Structures with a carboxyl group belong in the family of carboxylic acids. The functional group is the structure attached to the molecule; the family is the category that the molecule falls into because it possesses the functional group.

It is easy to confuse a molecular family with a functional group. Some functional groups are commonly referred to by their family name. Alcohol is a common example of a family that is often incorrectly used to indicate the hydroxy functional group. 

There are many functional groups. The most common groups are listed in the table in the upper righthand corner of your screen.

A carbon bonded to any functional group is said to be an α-carbon (alpha carbon). Moving away from the functional group, a carbon bonded to an α-carbon is said to be a β-carbon (beta carbon). This nomenclature continues down the Greek alphabet (e.g. α, β, γ, δ, ε, and so on). The carbon at the end of the line, regardless of the position number, is sometimes called the ω-carbon (omega carbon). A hydrogen attached to an α-carbon is an α-hydrogen. One attached to a β-carbon is a β-hydrogen, and so on. `,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Nucleophile means nucleus-loving. A nucleus is a group of positively charged protons. A nucleophile is a species with a concentration of negative charge looking for a concentration of positive charge to form a bond. The atom or functional group with the concentration of positive charge is called an electrophile. Nucleophiles attack electrophiles.',
        },
        {
          content_html: `On the MCAT, you may come across large, unfamiliar molecules. You will not be expected to recognize the large molecule or know its chemistry, but you will be expected to recognize its functional groups and estimate how they might behave. You should assume the functional group will exhibit the typical behavior of its functional group. 

First learn the names of the functional groups. As you study the reactions familiarize yourself with the “personality” of each group. How does it behave? Where do its electrons like to be and like to go? Is it hungry for positive or negative charge? How stable is it as a leaving group? Focus on the behavior of the functional group. You will begin to gain an intuition of organic chemistry that will allow you to make predictions about the outcome of unfamiliar reactions.`,
        },
        {
          content_html: `Unfortunately, there is often more than one name for a single organic compound. There is often at least one common name, and there is always a systematic IUPAC (International Union of Pure and Applied Chemistry) name. For many compounds, you will need to know both names.

The IUPAC rules for the systematic naming of organic compounds are quite complicated, spanning hundreds of pages. For the MCAT, you will need to know the following IUPAC rules. 

Hydrocarbons are compounds composed only of carbon and hydrogen. They include three families: alkane (only single bonds), alkene (one or more double bonds), and alkyne (one or more triple bonds). The names of alkanes, alkenes, and alkynes end with -ane, -ene, and -yne, respectively.`,
        },
      ],
    },
    {
      contents: [
        {
          content_html: `Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. 
    
In chemical reactions, all negative charges are due to electrons, and all positive charges are due to protons. Electrons are attracted to protons and repelled by other electrons.`,
        },
        {
          content_html: `The dash formula shows the bonds between each atom on a two-dimensional plane without showing the three-dimensional structure. Lone pairs of electrons may be added as dots. Lewis structures are often drawn using the dash formula.

The condensed formula does not show bonds. Central atoms are usually followed by the atoms that bond to them even when this is not the bonding order. For instance, the three hydrogens following the carbon in CH3NH2 bond to carbon, not to nitrogen.`,
        },
        {
          content_html: `In the bond-line formula, line intersections, corners, and endings represent a carbon atom unless a heteroatom is drawn in. Hydrogen atoms sufficient to complete each carbon’s octet (or satisfy any formal charges) are not usually drawn but are assumed to be present. 

The bond-line structure emphasizes functional groups by deemphasizing less reactive portions of a molecule. The bond-line formula is especially useful when viewing more complicated structures.`,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Movement of a pair of electrons in organic chemistry is shown by a double pronged arrow. When the arrow has only one prong, it is representing the movement of only one electron. The arrow always points from where the electrons start to where they end up.',
        },
        {
          content_html: `The Newman projection is used to compare the same molecule in various conformations. It provides a view down the axis of a single bond and shows the orientation of atoms rotated about the bond. 

The wedge and dash projection represents three-dimensions on a two dimensional page. In the wedge and dash projection the black wedge is assumed to be coming out of the page, the dashed wedge is assumed to be going into the page, and the lines are assumed to be in the plane of the page.`,
        },
        {
          content_html: `The index of hydrogen deficiency (IHD) or degree of unsaturation (DoU) indicates the number of rings and π bonds in a compound. If you have the structure drawn in front of you, the IHD is not too useful. You can find the IHD, simply by counting the rings and π bonds in the structure. However, the IHD is usually used to help you discover a structure when you can’t see the structure and you only know the molecular formula.

The reason for IHD is to figure out the structure. If you can already know the structure, just count the rings and п bonds.

Since saturating a structure requires the addition of two hydrogens for each π bond or ring, the IHD for any hydrocarbon (a molecule containing only carbons and hydrogens) is half the difference between the number of hydrogens on the compound and the number of hydrogens on a corresponding straight-chain alkane. This gives the formula below. `,
        },
        {
          content_html: `A functional group is an arrangement of specific atoms attached to a larger molecule. It has a unique set of predictable chemical behaviors. 

The behavior of one functional group may be modified by other functional groups attached to the same molecule. 

To a large extent, chemical behavior of a molecule can be predicted based upon its functional groups. When presented with an unfamiliar molecule, you should consider the behavior of its functional groups.`,
        },
        {
          content_html: `A family is the category into which structures possessing a specific functional group are placed. For instance, structures with an alkyl group belong in the family of alkanes. Structures with a carboxyl group belong in the family of carboxylic acids. The functional group is the structure attached to the molecule; the family is the category that the molecule falls into because it possesses the functional group.

It is easy to confuse a molecular family with a functional group. Some functional groups are commonly referred to by their family name. Alcohol is a common example of a family that is often incorrectly used to indicate the hydroxy functional group. 

There are many functional groups. The most common groups are listed in the table in the upper righthand corner of your screen.

A carbon bonded to any functional group is said to be an α-carbon (alpha carbon). Moving away from the functional group, a carbon bonded to an α-carbon is said to be a β-carbon (beta carbon). This nomenclature continues down the Greek alphabet (e.g. α, β, γ, δ, ε, and so on). The carbon at the end of the line, regardless of the position number, is sometimes called the ω-carbon (omega carbon). A hydrogen attached to an α-carbon is an α-hydrogen. One attached to a β-carbon is a β-hydrogen, and so on. `,
        },
      ],
    },
    {
      contents: [
        {
          content_html: 'Nucleophile means nucleus-loving. A nucleus is a group of positively charged protons. A nucleophile is a species with a concentration of negative charge looking for a concentration of positive charge to form a bond. The atom or functional group with the concentration of positive charge is called an electrophile. Nucleophiles attack electrophiles.',
        },
        {
          content_html: `On the MCAT, you may come across large, unfamiliar molecules. You will not be expected to recognize the large molecule or know its chemistry, but you will be expected to recognize its functional groups and estimate how they might behave. You should assume the functional group will exhibit the typical behavior of its functional group. 

First learn the names of the functional groups. As you study the reactions familiarize yourself with the “personality” of each group. How does it behave? Where do its electrons like to be and like to go? Is it hungry for positive or negative charge? How stable is it as a leaving group? Focus on the behavior of the functional group. You will begin to gain an intuition of organic chemistry that will allow you to make predictions about the outcome of unfamiliar reactions.`,
        },
        {
          content_html: `Unfortunately, there is often more than one name for a single organic compound. There is often at least one common name, and there is always a systematic IUPAC (International Union of Pure and Applied Chemistry) name. For many compounds, you will need to know both names.

The IUPAC rules for the systematic naming of organic compounds are quite complicated, spanning hundreds of pages. For the MCAT, you will need to know the following IUPAC rules. 

Hydrocarbons are compounds composed only of carbon and hydrogen. They include three families: alkane (only single bonds), alkene (one or more double bonds), and alkyne (one or more triple bonds). The names of alkanes, alkenes, and alkynes end with -ane, -ene, and -yne, respectively.`,
        },
      ],
    },
  ],
}

const chapterNested = {
  subchapters: [
    {
      contents: [
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
      ],
    },
    {
      contents: [
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
      ],
    },
    {
      contents: [
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
        {
          originalContent: {
            content_html: 'Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other. Electric charge makes chemical reactions happen. Like-charges repel each other and opposite charges attract each other.',
          },
        },
      ],
    },
  ],
}

import { calculateChapterTime } from '../calculate-chapter-time'

describe('calculate-chapter-time', () => {
  it('should calculate chapter reading time', async () => {
    const result = calculateChapterTime(chapter)

    expect(result).toEqual(29)
  })

  it('should handle custom content picking function', async () => {
    const extractBy = R.pipe(
      R.pluck('originalContent'),
      R.flatten,
      R.pluck('content_html')
    )

    const result = calculateChapterTime(chapterNested, extractBy)

    expect(result).toEqual(2)
  })
})
